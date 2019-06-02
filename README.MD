传送门教程：https://miyogurt.github.io/nodelover-books/#/koa-todo-api/搭建项目开发环境

源码地址：https://github.com/MiYogurt/todo-api

---

**1 新建项目**：`$ mkdir todo && cd todo && npm init -y && git init`

**2 安装 Typescript 环境**：`$ npm i -g typescript && tsc --init`

**3 安装依赖项**：`$ npm i koa -S && npm i @types/koa @types/node -D`

**4 配置tsconfig.json**：配置输出文件夹，且使其支持 async/await 特性。

```JavaScript
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es6",
        "noImplicitAny": false,
        "sourceMap": false,
        "outDir": "dist",
        "lib": [
            "es6",
            "es7"
        ]
    }
}
```

**5 创建 src/index.ts ：**

```Typescript
import * as Koa from 'koa';

const app = new Koa();

app.use(async ctx => {
    ctx.body = "Todo App";
});

app.listen(3000, () => {
    console.log("Server Stared on http://localhost:3000")
})
```

由于使用了 **Typescript** ，我们就可以在 **Node.js** 中使用 `es6 modules` 规范了。

✅ 我们先在命令行里面输入： `$ tsc` 

然后会对所有.ts文件进行编译。当编译完成之后，我们应该可以看到一个 dist 文件夹。


**6 package.json 增加 start 脚本**

```bash
"start": "node dist/index.js"
```

再在命令行里面运行：`npm start`

**7 部署 node 服务器的神器： pm2**：`$ npm i -g pm2`

难道每次写完代码我都需要重启服务器？

为了解决这个问题，我们需要 pm2 这个工具，这是一个部署 node 服务器的神器，能够实现自动重启。

✅ 在 package.json 里面添加一些脚本：

```JavaScript
"scripts": {
    "tsc": "tsc --watch",
    "start": "pm2 start dist/index.js --watch dist"
},
```

⚠️ 此时我们需要启动俩个控制台：先运行 tsc 命令，再运行 start。

```JavaScript
$ npm run tsc

/* 新建另一个窗口 */

$ npm run start
```

## 🔗 安装 koa 插件

🚀 所有 koa 插件都可以在这里找到：https://github.com/koajs/koa/wiki

```JavaScript
// 安装『body 解析插件』与『兼容性转换插件』
$ npm install koa-better-body koa-convert -S

// 安装『路由插件』
$ npm install koa-better-router -S
```

📝 修改我们的 `index.ts`

```JavaScript
import * as Koa from 'koa';
import * as bodyParser from 'koa-better-body';
import * as Router from 'koa-better-router';
import * as Convert from 'koa-convert';

const router = Router().loadMethods();

const app = new Koa();

router.get('/hello', async (ctx, next) => {
  ctx.body = `Hello world! Prefix: ${ctx.route.prefix}`
  await next()
});

router.get('/foobar', async (ctx, next) => {
  ctx.body = `Foo Bar Baz! ${ctx.route.prefix}`
  await next()
})

const api = Router({ prefix: '/api' })
api.extend(router)

app.use(Convert(bodyParser()));
app.use(router.middleware());
app.use(api.middleware());

app.listen(3000, () => {
    console.log("Server Stared on http://localhost:3000")
});
```

## 📊 数据库 sqlite3

为了简单的模拟数据库行为，我们使用最小的数据库 **sqlite3**。

> 下载 sqlite3 直接到官网的 download 页面：https://www.sqlite.org/download.html
> 
> 注意，假如您是 win 请下载： **sqlite-tools-win32-x86-3280000.zip**

每一个开发者都不应该直接操 作SQL，而是把更多的时间专注在业务上面去，所以我们需要 ORM，这里我们选择 `sequelize`。

```
// 推荐用 cnpm 安装 sqlite3
$ cnpm i sequelize @types/sequelize sqlite3 -S
```

## 🚀 安装 sqlite studio

下载地址：https://sqlitestudio.pl/index.rvt

在根目录下面创建一个 `storage/db.sqlite3` 的空文件用来当做数据库。

然后用 sqlite studio 打开这个文件。

![](https://s2.ax1x.com/2019/06/02/V8mZUP.png)

- 📝 创建 user 表

```sql
CREATE TABLE user (
    id       INTEGER       PRIMARY KEY AUTOINCREMENT,
    usernmae VARCHAR (255) NOT NULL
                           UNIQUE,
    email    VARCHAR (40)  UNIQUE
                           NOT NULL,
    password VARCHAR (255) NOT NULL
);
```

- 📝 创建 todo_folder 表

```sql
CREATE TABLE todo_folder (
    id      INTEGER PRIMARY KEY AUTOINCREMENT
                    UNIQUE,
    user_id INTEGER REFERENCES user (id) 
                    NOT NULL,
    title   TEXT    NOT NULL
);
```

- 📝 创建 todo 表

```sql
CREATE TABLE todo (
    id             INTEGER PRIMARY KEY AUTOINCREMENT
                           UNIQUE,
    todo_folder_id         REFERENCES todo_folder (id) 
                           NOT NULL,
    text           TEXT    NOT NULL,
    created_at     TIME,
    updated_at     TIME
);
```


## 🚀 安装 `password-hash`
用来处理用户密码，不存储用户的明文密码，而是存储加密后的。


✅ 新建 `src/db.ts`，用于测试连接数据库。

`$ npm i password-hash -S`

```Typescript
import { Sequelize, DataTypes, Model } from 'sequelize'
import * as ph from 'password-hash'
import { resolve } from 'path'

const sequelize = new Sequelize('db', null, null, {
    dialect: 'sqlite',
    storage: resolve(__dirname, '../storage/db.sqlite3')
})

class User extends Model {
    public id!: number;
    public usernmae!: string;
    public email!: string;
    public password!: string;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    timestamps: false,
    tableName: 'user',
})

User.create({
    username: 'yugo',
    email: 'belovedyogurt@gmail.com',
    password: ph.generate('123456')
}).then(console.log)
```

✅ 先执行 `tsc`，编译成功之后再执行 `node ./dist/db.js` 。

正常的话数据表会多一条数据，如图所示：

![](https://s2.ax1x.com/2019/06/02/V8dY34.png)

⚠️ 解决关于: TypeError: Class constructor Model cannot be invoked without 'new'

> 📝 tsconfig.json 将 "target" 改为 "es6" 即可

