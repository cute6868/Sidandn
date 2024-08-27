(function () {

    // 节点集
    let nodes = [];

    // 获取节点函数
    function getNode() {
        // 开启键盘监听
        document.addEventListener('keydown', (event) => {
            // 判断键盘按下的键是否为Ctrl键
            if (event.ctrlKey) {
                // 获取当前鼠标所在位置的节点
                const node = document.elementFromPoint(event.clientX, event.clientY);

                // 将节点添加到节点集里面
                nodes.push(node);

                // 关闭键盘监听
                document.removeEventListener('keydown', getNode);
            }
        });
    }

    nodes.forEach(node => {
        console.log(node);
    });

    getNode();

    nodes.forEach(node => {
        console.log(node);
    });

})()