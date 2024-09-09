// 封装函数：将消息发送到 background
function sendMessageToBackground(message, callback) {
    chrome.runtime.sendMessage(message, callback)
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
