// 封装函数：将消息发送到 background
function sendMessageToBackground(message, callback) {
    chrome.runtime.sendMessage(message, callback)
}


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


// 监听来自 popup 的消息，执行对应的逻辑处理操作
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // 出现频率最高的消息优先在上面
    switch (message.request) {
        case 'search':
            search(message, sender, sendResponse)
            return true  // true 代表异步等待结果，false 代表同步等待结果
        case 'load':
            load(message, sender, sendResponse)
            return true
        case 'run':
            run(message, sender, sendResponse)
            return true
        case 'edit':
            edit(message, sender, sendResponse)
            return true
        case 'address':
            address(message, sender, sendResponse)
            return true
        case 'rename':
            rename(message, sender, sendResponse)
            return true
        case 'remove':
            remove(message, sender, sendResponse)
            return true
        case 'create':
            create(message, sender, sendResponse)
            return true
        case 'stop':
            stop(message, sender, sendResponse)
            return true
        case 'clear':
            clear(message, sender, sendResponse)
            return true
    }
})


// 具体的逻辑处理操作
function search(message, sender, sendResponse) {

}
function load(message, sender, sendResponse) {
    sendMessageToBackground(message, (response) => {
        sendResponse(response)
    })
}
function run(message, sender, sendResponse) {

}
function edit(message, sender, sendResponse) {
    sendMessageToBackground(message, (response) => {
        sendResponse(response)
    })
}
function address(message, sender, sendResponse) {

    console.log(message);

    // 事件
    let CtrlAndClick = (event) => {

        // 检查是否同时按下了Ctrl键和鼠标左键
        if (event.ctrlKey && event.button === 0) {

            // 防止默认行为，例如选择文本
            event.preventDefault();

            // 获取鼠标所在位置的节点
            let path = buildPath(event.target);
            message.status = 1
            message.payload.data = path
            sendResponse(message);

            // 关闭事件监听
            document.removeEventListener('mousedown', CtrlAndClick);
        }
    }

    // 开启事件监听
    document.addEventListener('mousedown', CtrlAndClick);
}
function rename(message, sender, sendResponse) {
    sendMessageToBackground(message, (response) => {
        sendResponse(response)
    })
}
function remove(message, sender, sendResponse) {
    sendMessageToBackground(message, (response) => {
        sendResponse(response)
    })
}
function create(message, sender, sendResponse) {
    sendMessageToBackground(message, (response) => {
        sendResponse(response)
    })
}
function stop(message, sender, sendResponse) {
    // ...
}
function clear(message, sender, sendResponse) {
    sendMessageToBackground(message, (response) => {
        sendResponse(response)
    })
}










// // 获取鼠标所在位置的节点
// function () {

//     // 节点集
//     let nodes = [];

//     // 获取节点函数
//     function getNode() {
//         // 开启键盘监听
//         document.addEventListener('keydown', (event) => {
//             // 判断键盘按下的键是否为Ctrl键
//             if (event.ctrlKey) {
//                 // 获取当前鼠标所在位置的节点
//                 const node = document.elementFromPoint(event.clientX, event.clientY);

//                 // 将节点添加到节点集里面
//                 nodes.push(node);

//                 // 关闭键盘监听
//                 document.removeEventListener('keydown', getNode);
//             }
//         });
//     }

//     nodes.forEach(node => {
//         console.log(node);
//     });

//     getNode();

//     nodes.forEach(node => {
//         console.log(node);
//     });

// }
