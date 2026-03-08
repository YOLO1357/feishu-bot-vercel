# 飞书机器人回调服务 - Vercel 部署指南

## 📦 项目说明

这是一个简单的飞书机器人回调处理服务，用于处理卡片交互事件并回复用户消息。

## 🚀 部署步骤

### 第 1 步：准备 GitHub 账号

1. 如果没有 GitHub 账号，先注册：https://github.com/signup
2. 登录 GitHub

### 第 2 步：创建 Vercel 账号

1. 访问 https://vercel.com
2. 点击 "Sign Up"
3. 使用 GitHub 账号登录授权

### 第 3 步：上传代码到 GitHub

**方法 A：使用 GitHub 网页上传（推荐新手）**

1. 在 GitHub 创建一个新仓库，例如 `feishu-bot-callback`
2. 点击 "uploading an existing file"
3. 把这个文件夹里的所有文件拖进去：
   - `package.json`
   - `api/index.js`
   - `vercel.json`
   - `README.md`
4. 点击 "Commit changes"

**方法 B：使用 Git 命令**

```bash
cd C:\Users\Yolo.Dai\.openclaw\workspace\feishu-bot-vercel
git init
git add .
git commit -m "Initial commit"
# 然后关联你的 GitHub 仓库并 push
```

### 第 4 步：在 Vercel 部署

1. 登录 Vercel 后，点击 "Add New Project"
2. 选择 "Import Git Repository"
3. 找到你刚才创建的仓库，点击 "Import"
4. 保持默认设置，点击 "Deploy"
5. 等待部署完成（约 1-2 分钟）

### 第 5 步：获取部署 URL

部署完成后，你会看到一个 URL，格式类似：
```
https://feishu-bot-callback.vercel.app
```

**复制这个 URL，这就是你的回调地址！**

### 第 6 步：配置飞书机器人

1. 打开飞书开放平台 → 你的应用 → 事件与回调
2. 选择 **"将事件发送至 开发者服务器"**
3. 填写：
   - **请求地址**: `https://你的项目名.vercel.app`
   - **Verification Token**: 自己随便写一个（记住这个值）
4. 点击 "保存"
5. 保存成功后，点击 **"添加事件"**
6. 添加以下事件：
   - `im:card:interactive` (卡片交互)
   - `im:message.receive_at_bot` (机器人消息)
7. 再次保存

### 第 7 步：发布应用

1. 去 "版本管理与发布"
2. 创建新版本并发布
3. 发布后配置生效

## 🧪 测试

1. 在飞书里找到你的机器人
2. 点击 "订单询价" 按钮
3. 机器人应该会回复一个交互式卡片

## 📝 自定义回复内容

编辑 `api/index.js` 文件，修改以下函数来自定义回复：

- `createOrderInquiryCard()` - 订单询价回复
- `createWarehouseAddressCard()` - 仓库地址回复
- `createLogisticsIssueCard()` - 物流问题回复

## ⚠️ 注意事项

1. **冷启动**: Vercel 免费版有 1-3 秒冷启动延迟
2. **日志查看**: 在 Vercel 控制台 → Functions → 查看日志
3. **环境变量**: 如需配置密钥，在 Vercel 项目设置里添加

## 🆘 遇到问题？

1. 检查 Vercel 部署日志是否有错误
2. 确保飞书事件订阅已正确配置
3. 确认请求地址是 HTTPS 开头

---

**祝你部署成功！** 🎉
