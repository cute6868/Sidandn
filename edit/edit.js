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
// document.querySelector('#save').addEventListener('click', () => {

// })


// 点击删除按钮
// document.querySelector().addEventListener('click', () => {

// })
