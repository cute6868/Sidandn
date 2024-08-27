// 监听来自插件的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    // 异步任务-插入图片
    insertImage(request, sendResponse);


});

// 插入图片
async function insertImage(request, sendResponse) {

    // 向网页头部插入一个图像元素
    let div = document.createElement('div')
    div.innerHTML = `<img src="${request.url}" id="${request.imageDivId}"/>`
    document.querySelector('body').insertBefore(div, document.body.firstChild);

    // 点击图像，触发隐藏
    document.querySelector('div>img').addEventListener('click', function () {
        // 移除div元素，包括div里面的图片
        document.querySelector(div).remove(div);
    })

    // 向插件发送响应
    sendResponse({ state: "ok" });
}

