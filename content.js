// =============================== 封装函数 ===============================


// 封装函数：传入DOM元素对象，将构建出该元素的CSS选择器路径
function buildPath(element) {
    // 如果当前元素是文档的body元素，则直接返回它的标签名（小写形式）
    if (element === document.body) {
        return element.tagName.toLowerCase();
    }
    let path = [];

    // 循环遍历DOM树，直到到达body元素
    while (element.parentNode) {
        // 获取当前元素的标签名，并转换为小写
        let tagName = element.tagName.toLowerCase();

        // 获取当前元素的父元素的所有子元素
        let siblings = element.parentNode.children;

        let sameTagSiblings = Array.from(siblings).filter(function (sibling) {

            // 过滤出具有相同标签名的兄弟元素
            return sibling.tagName === element.tagName;
        });

        // 如果有多个具有相同标签名的兄弟元素
        if (sameTagSiblings.length > 1) {
            // 计算当前元素在其兄弟元素中的位置
            let index = sameTagSiblings.indexOf(element) + 1;

            // 生成CSS选择器中的:nth-of-type伪类，以确保唯一性
            tagName += ':nth-of-type(' + index + ')';
        }
        // 将构造的选择器添加到路径数组的前面
        path.unshift(tagName);

        // 移动到父元素，继续构建路径
        element = element.parentNode;
    }

    // 使用' > '将路径数组合并成字符串，得到完整的CSS选择器路径
    return path.join(' > ');
}


// 封装函数：模拟用户按键
function simulateKeyPress(keyCode) {
    let event = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        keyCode: keyCode,
        which: keyCode // 添加which属性以兼容更多浏览器
    });
    document.dispatchEvent(event);

    // 模拟keyup事件，以便模拟完整的按键操作
    event = new KeyboardEvent('keyup', {
        bubbles: true,
        cancelable: true,
        keyCode: keyCode,
        which: keyCode
    });
    document.dispatchEvent(event);
}


// 封装函数：模拟键盘输入字符串
function simulateTextInput(text, inputElement) {
    for (let i = 0; i < text.length; i++) {
        let charCode = text.charCodeAt(i);
        simulateKeyPress(charCode);
        inputElement.value += text[i];
    }
}


// 封装函数：模拟用户鼠标点击
function simulateMouseClick(element) {
    let event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    element.dispatchEvent(event);
}


// 封装函数：执行任务
function execute(task) {
    if (task.operations.length === 0) return
    task.operations.forEach(operation => {
        // 点击一下元素
        simulateMouseClick(document.querySelector(operation.element))

        // 如果content属性中有内容，则输入内容
        if (task.content !== '') {
            simulateTextInput(operation.content, document.querySelector(operation.element))
        }
    });
}


// =============================== content.js操作 ===============================


// 监听所有发送过来的消息（已设置为background->content通信专用）
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.from !== 'background') return false
    switch (message.request) {
        case 'address':
            address(message, sendResponse)
            return true
        case 'run':
            run(message, sendResponse)
            return true
    }
});


// 具体操作
function address(message, sendResponse) {
    // 点击事件
    let CtrlAndClick = (event) => {

        // 检查是否同时按下了Ctrl键和鼠标左键
        if (event.ctrlKey && event.button === 0) {

            // 防止默认行为，例如选择文本
            event.preventDefault();

            // 获取鼠标所在位置的节点
            let path = buildPath(event.target);
            message.status = 1
            message.from = 'content'
            message.payload.data = path
            sendResponse(message);

            // 关闭事件监听
            document.removeEventListener('mousedown', CtrlAndClick);
        }
    }

    // 开启事件监听
    document.addEventListener('mousedown', CtrlAndClick);
}

function run(message, sendResponse) {
    // 获取任务对象和时间
    let task = message.payload.data

    // 时间校验
    // 1.不限时间
    if (task.time === '0000-00-00 00:00:00') {
        execute(task)
        message.status = 1
        message.payload.data = null
        message.from = 'content'
        sendResponse(message)
    }
    // 2.限时间
    else {
        // 解析字符串，获取Date对象
        const [datePart, timePart] = task.time.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);
        const date = new Date(year, month - 1, day, hour, minute, second);

        // 时间差值
        let delta = date.getTime() - new Date().getTime();

        // 时间过期
        if (delta < 0) {
            message.status = 0
            message.payload.data = '任务执行时间已过期'
            message.from = 'content'
            sendResponse(message)
        }
        // 时间没有过期
        else {
            let timer = setTimeout(() => { execute(task) }, delta)
            message.status = 1
            message.payload.data = timer
            message.from = 'content'
            sendResponse(message)
        }
    }
}