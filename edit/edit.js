// ========================== 封装函数 ========================


// 封装函数：将消息以广播的形式发送到background.js
function sendMessageToBackground(message, callback) {
    chrome.runtime.sendMessage(message, callback)
}


// 封装函数：将数据渲染到页面上
function updatePage(task) {
    // 渲染 name 数据
    document.querySelector("#title").innerHTML = task.name

    // 渲染 time 数据
    document.querySelector("#time").setAttribute("value", task.time)

    // 渲染 operation 数据
    if (task.operations.length === 0) return
    let ul = document.querySelector("#operations")
    task.operations.forEach(operation => {
        // 创建一个li元素
        let li = document.createElement("li")

        // 给li完善各种数据
        li.className = "operation"
        li.innerHTML = `
            <div class="down-icon"></div>
            <input class="content" type="text">
            <button class="delete">删除</button>
        `

        // 获取li元素中的input元素，渲染内容数据
        let input = li.querySelector(".content")
        input.value = operation.content

        // 将li元素添加到ul元素中
        ul.appendChild(li)
    });
}


// ========================= edit.js操作 ===================================


// 1.定义任务对象
let task = {}


// 2.监听所有发送过来的消息（已设置为popup->edit通信专用）
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 判断消息来自哪里，如果是来自popup.js，则更新任务对象的id，并向background请求该任务的数据进行页面渲染
    if (message.from !== 'popup') return
    task.id = message.taskId
    sendMessageToBackground({
        from: 'edit',
        request: 'edit',
        status: 0,
        payload: {
            id: task.id,
            data: null
        }
    }, (response) => {
        if (!response.status) return

        // 更新任务对象
        task = response.payload.data

        // 更新页面
        updatePage(task)
    })

    sendResponse('ok')
});


// 点击添加按钮
document.querySelector('#add').addEventListener('click', () => {
    // 向background.js发送请求，再让background.js转发给content.js，获取鼠标点击元素的路径
    sendMessageToBackground({
        from: 'edit',
        request: "address",
        status: 0,
        payload: {
            id: null,
            data: null
        }
    }, (response) => {
        if (!response.status) return

        // 获取到元素之后，更新当前全局变量中所维护的task对象
        task.operations.push({
            element: response.payload.data,
            content: ''
        })

        // 同时，向页面中添加一条li元素
        let ul = document.querySelector("#operations")
        let li = document.createElement("li")
        li.className = "operation"
        li.innerHTML = `
            <div class="down-icon"></div>
            <input class="content" type="text">
            <button class="delete">删除</button>
        `
        ul.appendChild(li)
    })
})


// 点击保存按钮
document.querySelector('#save').addEventListener('click', () => {
    // 获取所有li元素的input元素里面的文本内容
    let contents = Array.from(document.querySelectorAll('.content')).map((input) => input.value);

    // 更新任务对象里每一个操作的文本内容
    for (let i = 0; i < task.operations.length; i++) {
        task.operations[i].content = contents[i]
    }

    // 更新任务对象里面的time
    task.time = document.querySelector("#time").value

    // 将任务对象发送给background.js
    sendMessageToBackground({
        from: 'edit',
        request: "edit",
        status: 0,
        payload: {
            id: task.id,
            data: task
        }
    }, (response) => {
        if (!response.status) return
        window.close()
    })
})


// 点击删除按钮
document.querySelector('#operations').addEventListener('click', (event) => {
    // 判断点击的元素是不是删除按钮
    if (event.target.className !== 'delete') return

    // 获取当前按钮所在的li元素
    let li = event.target.parentElement

    // 获取li元素在其父元素的所有子元素中的索引位置
    let index = Array.from(li.parentElement.children).indexOf(li)

    // 根据索引值删除数组中对应的操作对象
    task.operations.splice(index, 1)

    // 同时，将页面中对应的li元素也删除
    li.remove()
})


// ========================== 检查输入时间的合法性 ============================

// 获取当前时间的函数，格式为 "YYYY-MM-DD HH:MM:SS"
function getCurrentTime(delay = 0) {
    const now = new Date();

    // 延时delay毫秒
    now.setTime(now.getTime() + delay);

    const year = now.getFullYear();

    // 月份是从0开始的
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // 补零函数
    const zeroPad = (num) => num.toString().padStart(2, '0');

    return `${year}-${zeroPad(month)}-${zeroPad(day)} ${zeroPad(hours)}:${zeroPad(minutes)}:${zeroPad(seconds)}`;
}

// 检查输入时间的合法性
function checkTime(time) {
    // 如果时间字符串为0000-00-00 00:00:00，则表示"不限时间"
    if (time === '0000-00-00 00:00:00') return time

    // 正则表达式匹配格式为 "YYYY-MM-DD HH:MM:SS" 的时间字符串
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    // 检查格式是否正确
    if (!regex.test(time)) {
        return getCurrentTime(10000)
    }

    // 解析输入的时间字符串
    const [datePart, timePart] = time.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);

    // 利用日期对象会自动合理化时间的特性，判断合理化前后的时间是否一致，如果一致则时间合理
    const date = new Date(year, month - 1, day, hour, minute, second);

    // 检查时间的合理性
    if (
        date.getFullYear() !== year ||
        date.getMonth() + 1 !== month ||
        date.getDate() !== day ||
        date.getHours() !== hour ||
        date.getMinutes() !== minute ||
        date.getSeconds() !== second
    ) {
        return getCurrentTime(10000);
    }

    // 检查时间的先后顺序，如果输入的时间在当前时间之前则返回当前时间
    if (date < new Date()) {
        return getCurrentTime(10000);
    }

    // 如果时间格式正确、合理且时间先后顺序正确，则返回输入的时间
    return time;
}

// 检查输入时间合法性
document.querySelector("#time").addEventListener('blur', () => {
    // 获取元素对象
    let element = document.querySelector('#time')

    // 检查时间的合法性，并渲染到页面中
    element.value = checkTime(element.value)
})