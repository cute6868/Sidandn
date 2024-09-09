// 封装函数：将消息发送到 popup
// 注意！sendMessageToPopup将message发送给popup时，也会被同时发送到background，我们需要在background中，打上补丁
function sendMessageToPopup(message, callback) {
    chrome.runtime.sendMessage(message, callback)
}


// 定义"基本请求消息"
message = {
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
        console.log(response2);
    })
})


