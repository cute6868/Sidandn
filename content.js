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


// ？？？
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


// =============================== content.js操作 ===============================


// 监听来自background.js的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);
    sendResponse('how are you');
    return true;
});