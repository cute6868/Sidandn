// ======================== 封装函数 ==========================


// 封装函数：将消息以广播的形式发送到background.js
function sendMessageToBackground(message, callback) {
    chrome.runtime.sendMessage(message, callback)
}


// 封装函数：打开一个新窗口
function openWindow(url, message, callback, width = 560, height = 390) {

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
        // 页面加载
        function pageLoad(tabId, changeInfo, tab) {
            // 确保是我们所创建窗口的标签页，并且页面已经加载完成
            if (tabId !== createdWindow.tabs[0].id || changeInfo.status !== 'complete') return

            // 发送信息到新窗口页面（专用通信通道，不会影响其他组件的通信）
            chrome.tabs.sendMessage(tabId, message, callback)

            // 移除事件监听
            chrome.tabs.onUpdated.removeListener(pageLoad)
        }
        // 监听页面加载
        chrome.tabs.onUpdated.addListener(pageLoad)
    })
}


// ========================= popup.js操作 ===================================


// 加载必要内容
// 1.加载当前content_script所在标签页的id
// 2.加载数据库中的任务（需要 id 和 name 渲染为<li>标签）
document.addEventListener('DOMContentLoaded', (event) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // 获取当前content_script所在标签页的 id
        contentId = Number(tabs[0].id)

        // 发送请求消息
        sendMessageToBackground({
            from: 'popup',
            request: 'load',
            status: 0,
            payload: {
                id: null,
                data: contentId
            }
        }, (response) => {
            if (!response.status) return
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
        })
    });
})


// "清空任务"按钮
document.querySelector('.top .btns:nth-child(2)').addEventListener('click', (event) => {
    // 弹出确认框
    if (confirm('警告，此操作不可逆！您确定要删除所有的任务吗？')) {
        // 发送请求消息
        sendMessageToBackground({
            from: 'popup',
            request: 'clear',
            status: 0,
            payload: {
                id: null,
                data: null
            }
        }, (response) => {
            if (!response.status) return
            // 重新渲染页面（即：删除所有<li>标签）
            document.querySelector('.bottom .tasks').innerHTML = ''
        })
    }
})


// "终止运行"按钮
document.querySelector('.top .btns:nth-child(1)').addEventListener('click', (event) => {
    // 发送请求消息
    sendMessageToBackground({
        from: 'popup',
        request: 'stop',
        status: 0,
        payload: {
            id: null,
            data: null
        }
    }, (response) => {
        if (!response.status) return
        // 无需渲染页面，后端终止运行即可，前端什么都不用做
        console.log(response)
    })
})


// "搜索任务"框
document.querySelector('.bottom .search input').addEventListener('input', (event) => {
    // 发送请求消息
    sendMessageToBackground({
        from: 'popup',
        request: 'search',
        status: 0,
        payload: {
            id: null,
            data: event.target.value
        }
    }, (response) => {
        if (!response.status) return
        // 重新渲染页面???
        console.log(response)
    })
})


// "创建新任务"按钮
document.querySelector('.bottom .search button').addEventListener('click', (event) => {
    // 获取数据
    let name = prompt('新任务的名称：')

    // 发送请求
    if (name) {
        sendMessageToBackground({
            from: 'popup',
            request: 'create',
            status: 0,
            payload: {
                id: null,
                data: name
            }
        }, (response) => {
            if (!response.status) return
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
        sendMessageToBackground({
            from: 'popup',
            request: 'run',
            status: 0,
            payload: {
                id: Number(num),
                data: null
            }
        }, (response) => {
            if (!response.status) {
                confirm(response.payload.data)
            }
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
                sendMessageToBackground({
                    from: 'popup',
                    request: taskType,
                    status: 0,
                    payload: {
                        id: Number(num),
                        data: newName
                    }
                }, (response) => {
                    if (!response.status) return
                    // 重新渲染页面，通过id定位到对应的<li>元素，并修改其 name
                    document.querySelector(`#task-${response.payload.id} .name`).innerText = response.payload.data
                })
                break;
            // =============================
            case 'remove':
                // 获取数据
                if (!confirm('确认删除吗？')) return

                // 发送请求
                sendMessageToBackground({
                    from: 'popup',
                    request: taskType,
                    status: 0,
                    payload: {
                        id: Number(num),
                        data: null
                    }
                }, (response) => {
                    if (!response.status) return
                    // 重新渲染页面，通过id定位到对应的<li>元素，将其直接删除！
                    document.querySelector(`#task-${response.payload.id}`).remove()

                })
                break;
            // =============================
            case 'edit':
                // 打开新窗口，并发送信息（专用通信通道，不会影响其他组件通信）
                openWindow('edit/edit.html', { from: 'popup', taskId: Number(num) }, (response) => { })
        }
    }
})
