// 封装函数：将消息发送到 content_scripts
function sendMessageToCurrentTab(message, callback) {

    // 调用浏览器API，查询当前在窗口中显示的标签页(选项卡)
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

        // 获取当前在窗口中显示的标签页(选项卡)
        let currentTab = tabs[0]

        // 调用浏览器API，向此标签页(选项卡)发送消息
        chrome.tabs.sendMessage(

            // 参数1：标签页(选项卡)的id
            currentTab.id,

            // 参数2：发送的消息
            message,

            // 参数3：回调函数
            callback
        )
    })
}


// 封装函数：打开一个新窗口
function openWindow(url, callback, width = 500, height = 309) {

    // 创建一个新的浏览器窗口，使其在浏览器中居中显示
    const left = Math.round((screen.availWidth - width) / 2);
    const top = Math.round((screen.availHeight - height) / 2);

    chrome.windows.create({
        url: chrome.runtime.getURL(url),
        type: 'popup',
        width: width,
        height: height,
        left: left,
        top: top,
        focused: true

    }, (createdWindow) => {

        // 检测窗口是否创建成功
        if (chrome.runtime.lastError) {
            console.error('Error creating window:', chrome.runtime.lastError);
            return;
        }

        // 设置一个函数，用来监听来自新窗口的消息
        const messageListener = (message, sender, sendResponse) => {
            if (sender.tab && sender.tab.windowId === createdWindow.id) {

                // 调用回调函数处理消息
                callback(message, sendResponse);

                // 返回 true 表示稍后发送响应
                return true;
            }
        };

        // 添加消息监听器，函数放进去
        chrome.runtime.onMessage.addListener(messageListener);

        // 保存用于移除监听器的引用，方便移除监听器
        createdWindow.messageListener = messageListener;

        // 监听窗口关闭事件，当窗口关闭时，移除消息监听器
        chrome.windows.onRemoved.addListener((windowId) => {
            // 检查关闭的窗口是否是我们创建的窗口
            if (createdWindow && createdWindow.id === windowId) {
                // 移除消息监听器
                chrome.runtime.onMessage.removeListener(createdWindow.messageListener);
            }
        });
    });
}


// ================ popup 页面操作 =================

// 加载数据库中的任务（需要 id 和 name 渲染为<li>标签）
document.addEventListener('DOMContentLoaded', (event) => {
    // 发送请求消息
    sendMessageToCurrentTab({
        request: 'load',
        status: 0,
        payload: {
            id: null,
            data: null
        }
    }, (response) => {
        if (response.status === 1) {
            let arr = response.payload.data
            let ul = document.querySelector('.bottom .tasks')

            // 渲染页面（加载数据库中的任务，并渲染为<li>标签）
            arr.forEach(item => {
                let li = `
                <li id="task-${item.id}">
                    <div class="name">${item.name}</div>
                    <div class="run"></div>
                    <div class="more">
                        <div class="content">
                            <button id="rename">重命名</button>
                            <button id="edit">编辑操作</button>
                            <button id="remove">删除</button>
                        </div>
                    </div>
                </li>
                `
                // 通过DOMParser解析字符串，并获取<li>元素，安全地创建<li>元素
                let doc = new DOMParser().parseFromString(li, 'text/html')
                li = doc.body.firstChild
                ul.insertBefore(li, ul.firstChild)
            });
        }
    })
})


// "清空任务"按钮
document.querySelector('.top .btns:nth-child(2)').addEventListener('click', (event) => {

    // 弹出确认框
    if (confirm('警告，此操作不可逆！您确定要删除所有的任务吗？')) {
        // 发送请求消息
        sendMessageToCurrentTab({
            request: 'clear',
            status: 0,
            payload: {
                id: null,
                data: null
            }
        }, (response) => {
            if (response.status === 1) {
                // 重新渲染页面（即：删除所有<li>标签）
                document.querySelector('.bottom .tasks').innerHTML = ''
            }
        })
    }
})


// "终止运行"按钮
document.querySelector('.top .btns:nth-child(1)').addEventListener('click', (event) => {

    // 发送请求消息
    sendMessageToCurrentTab({
        request: 'stop',
        status: 0,
        payload: {
            id: null,
            data: null
        }
    }, (response) => {
        // 无需渲染页面，后端终止运行即可，前端什么都不用做
        console.log(response)
    })
})


// "搜索任务"框
document.querySelector('.bottom .search input').addEventListener('input', (event) => {

    // 发送请求消息
    sendMessageToCurrentTab({
        request: 'search',
        status: 0,
        payload: {
            id: null,
            data: event.target.value
        }
    }, (response) => {
        // 重新渲染页面？？
        console.log(response)
    })
})


// "创建新任务"按钮
document.querySelector('.bottom .search button').addEventListener('click', (event) => {

    // 获取数据
    let name = prompt('新任务的名称：')

    // 发送请求
    if (name) {
        sendMessageToCurrentTab({
            request: 'create',
            status: 0,
            payload: {
                id: null,
                data: name
            }
        }, (response) => {
            if (response.status === 1) {
                // 重新渲染页面（即：插入一个<li>标签到<ul>的头部，需要用到 id 和 name）
                let ul = document.querySelector('.bottom .tasks')
                let li = `
                <li id="task-${response.payload.id}">
                    <div class="name">${response.payload.data}</div>
                    <div class="run"></div>
                    <div class="more">
                        <div class="content">
                            <button id="rename">重命名</button>
                            <button id="edit">编辑操作</button>
                            <button id="remove">删除</button>
                        </div>
                    </div>
                </li>
                `
                // 通过DOMParser解析字符串，并获取<li>元素，安全地创建<li>元素
                let doc = new DOMParser().parseFromString(li, 'text/html')
                li = doc.body.firstChild
                ul.insertBefore(li, ul.firstChild)
            }
        })
    }
})


// 使用事件委托，实现监控用户的操作（当点击<ul class="tasks">里面的某个元素时，将执行对应元素的功能）
document.querySelector('.bottom .tasks').addEventListener('click', (event) => {

    // 不管点击了什么，都先隐藏"按钮组"
    document.querySelectorAll('.tasks .more .content').forEach(item => {
        item.style.display = 'none'
    })

    // 判断所点击的元素是否为"run按钮"
    if (event.target && event.target.matches('.run')) {

        // 获取对应<li>元素的id属性，并解析为"任务序列号"
        let num = event.target.closest('li').getAttribute('id').split('-')[1]

        // 发送请求
        sendMessageToCurrentTab({
            request: 'run',
            status: 0,
            payload: {
                id: Number(num),
                data: null
            }
        }, (response) => {
            // 后端运行即可，前端无需渲染页面
            console.log(response)
        })
    }

    // 判断所点击的元素是否为"more按钮"
    else if (event.target && event.target.matches('.more')) {

        // 显示"按钮组"
        event.target.querySelector('.content').style.display = 'block'
    }

    // 判断所点击的元素是否为more里面的"按钮组"的某一个按钮
    else if (event.target && event.target.matches('.content button')) {

        // 获取对应<li>元素的id属性，并解析为"任务序列号"
        let num = event.target.closest('li').getAttribute('id').split('-')[1]

        // 获取按钮的id属性
        let taskType = event.target.getAttribute('id')

        // 分析按钮的id属性，收集不同的数据
        switch (taskType) {
            // =============================
            case 'rename':
                // 获取数据
                let newName = prompt('新名称：')
                if (newName === null || newName === '') return
                // 发送请求
                sendMessageToCurrentTab({
                    request: taskType,
                    status: 0,
                    payload: {
                        id: Number(num),
                        data: newName
                    }
                }, (response) => {
                    if (response.status === 1) {
                        // 重新渲染页面，通过id定位到对应的<li>元素，并修改其 name
                        document.querySelector(`#task-${response.payload.id} .name`).innerText = response.payload.data
                    }
                })
                break;
            // =============================
            case 'remove':
                // 获取数据
                if (!confirm('确认删除吗？')) return
                // 发送请求
                sendMessageToCurrentTab({
                    request: taskType,
                    status: 0,
                    payload: {
                        id: Number(num),
                        data: null
                    }
                }, (response) => {
                    if (response.status === 1) {
                        // 重新渲染页面，通过id定位到对应的<li>元素，将其直接删除！
                        document.querySelector(`#task-${response.payload.id}`).remove()
                    }
                })
                break;
            // =============================
            case 'edit':
                // 打开编辑页面，请求数据操作，全部交给编辑页自行处理，popup只当个信息中转站
                openWindow('edit/edit.html', (message, sendResponse) => {
                    // 当编辑页不知道当前任务id时，将当前任务id响应给它
                    if (message.payload.id === null) {
                        message.payload.id = Number(num)
                        sendResponse(message)
                    } else {
                        // 当编辑页知道当前任务id时，想要通过id请求其他数据，帮他转发请求即可
                        // 但这里有个小改动需要注意，用 "status: 1" 来标记此edit请求，是来自popup页面的，而不是edit页面
                        message.status = 1
                        sendMessageToCurrentTab(message, (response) => {
                            sendResponse(response)
                        })
                    }
                });
        }
    }
})
