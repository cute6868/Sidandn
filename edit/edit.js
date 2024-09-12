// 封装函数：将消息发送到 popup
// 注意！sendMessageToPopup将message发送给popup时，也会被同时发送到background，我们需要在background中，打上补丁
function sendMessageToPopup(message, callback) {
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


// 封装函数：添加一条操作
function add() {
    // 向content_script发送一条鼠标监控消息，请求获取鼠标点击的元素（本质上获取的是元素的路径，而非元素对象本身）
    sendMessageToPopup({
        request: "address",
        status: 0,
        payload: {
            id: null,
            data: null
        }
    }, (response) => {
        console.log(response.payload.data, 666);

        if (response.status === 1) {
            // 获取到元素之后，更新当前窗口内存中所维护的task对象
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
        }
    })
}


// 定义任务对象
let task = {}


// 定义"基本请求消息"
let message = {
    request: 'edit',
    status: 0,
    payload: {
        id: null,
        data: null
    }
}


// 发送"基本请求消息"，获取当前edit任务的id信息
sendMessageToPopup(message, (response1) => {

    // 发送"其他内容请求消息"，获取当前任务的所有edit内容，做好渲染数据的准备
    sendMessageToPopup(response1, (response2) => {

        // 获取到了任务
        task = response2.payload.data

        // 重新渲染页面
        updatePage(task)
    })
})


// 监听添加按钮的点击事件
document.querySelector('#add').addEventListener('click', () => {
    add()
})