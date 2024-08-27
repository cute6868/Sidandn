// 点击more...图标效果
const iconMoreContainers = document.querySelectorAll('.icon-more.icon-container');
const floatBoxes = document.querySelectorAll('.float-box');

iconMoreContainers.forEach((iconMore, index) => {
    iconMore.addEventListener('click', () => {
        floatBoxes[index].style.display = 'block';
    });
});

document.addEventListener('click', (event) => {
    floatBoxes.forEach((floatBox, index) => {
        if (!floatBox.contains(event.target) && event.target !== iconMoreContainers[index]) {
            floatBox.style.display = 'none';
        }
    });
});


// 重命名
function rename(event) {

}


// 编辑操作
function edit(event) {

}


// 删除
function remove(event) {

}

// 点击run图标效果
const iconRunContainers = document.querySelectorAll('.icon-more.icon-container');
iconRunContainers.forEach((iconRun, index) => {
    iconRun.addEventListener('click', run);
});

// 启动任务
function run(event) {

}










// 生成图片唯一ID
function guidGenerator() {
    const S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

// 绑定点击事件
// document.querySelector('#btn').addEventListener('click', () => {

//     // 调用浏览器API，查询当前在窗口的标签页(选项卡)
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//         // 当前在窗口的标签页(选项卡)
//         let tab = tabs[0]

//         // 调用浏览器API，向此标签页(选项卡)发送消息
//         chrome.tabs.sendMessage(
//             // 参数1：标签页(选项卡)的id
//             tab.id,

//             // 参数2：发送的消息
//             {
//                 url: chrome.runtime.getURL("images/star.png"),
//                 imageDivId: `${guidGenerator()}`,
//                 tabId: tab.id
//             },

//             // 参数3：回调函数
//             function (response) {
//                 let div = document.createElement('div')
//                 div.innerText = `执行结果：${response.state}`
//                 document.querySelector('body').insertBefore(div, document.body.firstChild)
//                 // window.close();
//             }
//         )
//     })
// });