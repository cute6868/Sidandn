// =================================== 数据库接口 ==================================


// 定义一个 Database 类来封装 IndexedDB 操作
class Database {
    constructor(dbName, dbVersion) {
        this.dbName = dbName
        this.dbVersion = dbVersion
        this.db = null
    }

    // 打开数据库并创建对象存储空间
    open() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                // 如果数据库已经打开，直接解析
                resolve(this.db)
                return
            }

            const request = indexedDB.open(this.dbName, this.dbVersion)

            request.onupgradeneeded = (event) => {
                // 创建或升级数据库版本时触发
                this.db = event.target.result
                if (!this.db.objectStoreNames.contains('taskStore')) {
                    // 创建名为'taskStore'的对象存储空间，以'id'作为主键
                    this.db.createObjectStore('taskStore', { keyPath: 'id' })
                }
            }

            request.onsuccess = (event) => {
                // 数据库打开成功
                this.db = event.target.result
                resolve(this.db)
            }

            request.onerror = (event) => {
                // 数据库打开失败
                reject(event.target.error)
            }
        })
    }

    // 添加数据
    add(data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not opened'))
                return
            }

            const transaction = this.db.transaction(['taskStore'], 'readwrite')
            const store = transaction.objectStore('taskStore')
            const request = store.add(data)

            request.onsuccess = () => {
                // 添加成功
                resolve(request.result)
            }

            request.onerror = () => {
                // 添加失败
                reject(request.error)
            }
        })
    }

    // 获取数据
    get(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not opened'))
                return
            }

            const transaction = this.db.transaction(['taskStore'], 'readonly')
            const store = transaction.objectStore('taskStore')
            const request = store.get(id)

            request.onsuccess = () => {
                // 获取成功
                resolve(request.result)
            }

            request.onerror = () => {
                // 获取失败
                reject(request.error)
            }
        })
    }

    // 更新数据
    update(data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not opened'))
                return
            }

            const transaction = this.db.transaction(['taskStore'], 'readwrite')
            const store = transaction.objectStore('taskStore')
            const request = store.put(data)

            request.onsuccess = () => {
                // 更新成功
                resolve(request.result)
            }

            request.onerror = () => {
                // 更新失败
                reject(request.error)
            }
        })
    }

    // 删除数据
    remove(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not opened'))
                return
            }

            const transaction = this.db.transaction(['taskStore'], 'readwrite')
            const store = transaction.objectStore('taskStore')
            const request = store.delete(id)

            request.onsuccess = () => {
                // 删除成功
                resolve()
            }

            request.onerror = () => {
                // 删除失败
                reject(request.error)
            }
        })
    }

    // 清空所有数据
    clearAll() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not opened'));
                return;
            }

            // 创建一个事务并指定要访问的对象存储
            const transaction = this.db.transaction(['taskStore'], 'readwrite');
            const store = transaction.objectStore('taskStore');

            // 使用游标遍历所有记录并删除它们
            store.openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    // 如果游标存在，则删除当前记录
                    cursor.delete();
                    // 移动到下一个记录
                    cursor.continue();
                }
            };

            transaction.oncomplete = () => {
                // 事务完成，所有数据已清空
                resolve();
            };

            transaction.onerror = (event) => {
                // 事务失败
                reject(event.target.error);
            };
        });
    }

    // 获取所有的id和name
    getAllIdsAndNames() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not opened'));
                return;
            }

            const transaction = this.db.transaction(['taskStore'], 'readonly');
            const store = transaction.objectStore('taskStore');
            const tasks = [];

            // 使用游标遍历所有记录
            store.openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    // 将 id 和 name 添加到结果数组中
                    tasks.push({ id: cursor.value.id, name: cursor.value.name });
                    // 移动到下一个记录
                    cursor.continue();
                }
            };

            transaction.oncomplete = () => {
                // 事务完成，返回所有任务的 id 和 name
                resolve(tasks);
            };

            transaction.onerror = (event) => {
                // 事务失败
                reject(event.target.error);
            };
        });
    }

    // 获取所有的id
    getAllIds() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not opened'));
                return;
            }

            const transaction = this.db.transaction(['taskStore'], 'readonly');
            const store = transaction.objectStore('taskStore');
            const taskIds = [];

            // 使用游标遍历所有记录
            store.openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    // 将 id 添加到结果数组中
                    taskIds.push(cursor.value.id);
                    // 移动到下一个记录
                    cursor.continue();
                }
            };

            transaction.oncomplete = () => {
                // 事务完成，返回所有任务的 id
                resolve(taskIds);
            };

            transaction.onerror = (event) => {
                // 事务失败
                reject(event.target.error);
            };
        });
    }
}


// 创建 Database 实例
const db = new Database('ExtensionDatabase', 1)


// =================================== 封装函数 ==================================


// 封装函数：添加新任务
async function addTask(task) {
    try {
        // 确保数据库已经打开
        await db.open()

        // 添加数据
        const taskId = await db.add(task)
        return taskId

    } catch (error) {
        console.error('Error adding task:', error)
    }
}


// 封装函数：获取任务
async function getTask(taskId) {
    try {
        // 确保数据库已经打开
        await db.open()

        // 获取数据
        const task = await db.get(taskId)
        return task

    } catch (error) {
        console.error('Error getting task:', error)
    }
}


// 封装函数：更新任务
async function updateTask(task) {
    try {
        // 确保数据库已经打开
        await db.open()

        // 更新数据
        const taskId = await db.update(task)
        return taskId

    } catch (error) {
        console.error('Error updating task:', error)
    }
}


// 封装函数：删除任务
async function removeTask(taskId) {
    try {
        // 确保数据库已经打开
        await db.open()

        // 删除数据
        await db.remove(taskId)

    } catch (error) {
        console.error('Error removing task:', error)
    }
}


// 封装函数：清空所有任务
async function clearAllTask() {
    try {
        // 确保数据库已经打开
        await db.open();

        // 清空所有数据
        await db.clearAll();

    } catch (error) {
        console.error('Error clearing all data:', error);
    }
}


// 封装函数：获取所有任务的 id 和 name
async function getAllTaskIdsAndNames() {
    try {
        // 确保数据库已经打开
        await db.open();

        // 获取所有任务的 id 和 name
        const res = await db.getAllIdsAndNames();
        return res;

    } catch (error) {
        console.error('Error getting tasks:', error);
    }
}


// 封装函数：获取所有任务的 id
async function getAllTaskIds() {
    try {
        // 确保数据库已经打开
        await db.open();

        // 获取所有任务的 id
        const taskIds = await db.getAllIds();
        return taskIds;

    } catch (error) {
        console.error('Error getting task IDs:', error);
    }
}


// 全局变量：保存当前content_script所在标签页的id
let contentId = null;


// 封装函数：将消息以专用通道的方式发送到content.js
function sendMessageToContent(message, callback) {
    chrome.tabs.sendMessage(contentId, message, callback);
}


// ======================================= background.js操作 ========================================


// ============= 监听所有发送过来的消息 ==============
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 处理来自popup.js的消息
    if (message.from == "popup") {
        switch (message.request) {
            case 'search':
                search(message, sender, sendResponse)
                return true     // true 代表异步等待结果
            case 'load':
                load(message, sender, sendResponse)
                return true
            case 'run':
                run(message, sender, sendResponse)
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
    }
    // 处理来自popup.js的消息
    else if (message.from == 'edit') {
        switch (message.request) {
            case 'edit':
                edit(message, sender, sendResponse)
                return true
            case 'address':
                address(message, sender, sendResponse)
                return true
        }
    }
})


// ================= 具体的处理操作 ===================


// 1.处理popup.js的消息
async function search(message, sender, sendResponse) {
    // 解析当前的搜索条件
    // 从数据库中获取所有的任务的 id 和 name
    // 查询匹配项
    // 返回查询结果
}
async function load(message, sender, sendResponse) {
    // 更新content_script所在标签页的id  
    contentId = message.payload.data

    // 获取所有任务的 id 和 name
    let array = await getAllTaskIdsAndNames()
    if (array.length >= 0) {
        message.status = 1
        message.from = 'background'
        message.payload.data = array
        sendResponse(message)
    }
}
async function run(message, sender, sendResponse) {
    // 从数据库中获取任务对象
    message.payload.data = await getTask(message.payload.id)
    message.from = 'background'

    // 将任务对象交给content.js
    sendMessageToContent(message, (response) => {
        response.from = 'background'
        sendResponse(response)
    })
}
async function rename(message, sender, sendResponse) {
    let task = await getTask(message.payload.id)
    task.name = message.payload.data
    let taskId = await updateTask(task)
    message.status = 1
    message.from = 'background'
    message.payload.id = taskId
    sendResponse(message)
}
async function remove(message, sender, sendResponse) {
    await removeTask(message.payload.id)
    message.status = 1
    message.from = 'background'
    sendResponse(message)
}
async function create(message, sender, sendResponse) {

    // 给新任务分配 id
    let id = 0
    let ids = await getAllTaskIds()
    while (ids.includes(id)) {
        id++
    }

    // 构建基本的任务对象
    task = {
        id: id,
        name: message.payload.data,
        time: '0000-00-00 00:00:00',
        operations: []
    }

    // 将其添加到数据库中
    let taskId = await addTask(task)
    if (taskId >= 0) {
        message.status = 1
        message.from = 'background'
        message.payload.id = taskId
        sendResponse(message)
    }
}
async function stop(message, sender, sendResponse) {
    // 向content.js发送停止请求
    // 将content.js的响应转发给popup.js
}
async function clear(message, sender, sendResponse) {
    await clearAllTask()
    message.status = 1
    message.from = 'background'
    sendResponse(message)
}


// 2.处理edit.js的消息
async function edit(message, sender, sendResponse) {

    // 如果edit请求里面没有数据，说明是请求获取数据库的数据用来渲染edit页面
    if (message.payload.data === null) {
        let task = await getTask(message.payload.id)
        message.status = 1;
        message.from = 'background'
        message.payload.data = task
        sendResponse(message)
    }
    // 否则，说明有新的edit数据来了，要更新数据库里面的数据
    else {
        let taskId = await updateTask(message.payload.data)
        message.status = 1;
        message.from = 'background'
        message.payload.id = taskId
        sendResponse(message)
    }
}
async function address(message, sender, sendResponse) {
    // 将消息转发消息到content.js
    message.from = 'background'
    sendMessageToContent(message, (response) => {
        response.from = 'background'
        sendResponse(response)
    })
}
