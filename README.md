---
title: Lottery
emoji: 🚀
colorFrom: purple
colorTo: indigo
sdk: docker
pinned: false
license: apache-2.0
short_description: lottery-api
---

# Hello Lottery 🚀

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference

**在线体验**: [https://koala9527-lottery.hf.space/](https://koala9527-lottery.hf.space/)

本项目是一个基于深度学习的彩票OCR及中奖检测系统。通过神经网络识别彩票图片中的信息，并自动核对中奖结果。

## ✨ 功能特性

*   **多模型支持**：支持**体彩超级大乐透**和**福彩双色球**。
*   **多种玩法**：支持单式、复式、胆拖等多种投注方式。
*   **自动化流程**：一键上传图片，自动完成检测、识别和核对。
*   **双重接口**：提供直观的 Web 界面 (Gradio) 和 高效的 API 接口 (Flask)。

## 🛠️ 项目逻辑

主要处理流程如下：

1.  **图像输入**：接收包含彩票的图片。
2.  **目标检测 (Detection)**：使用 YOLOv5 等目标检测模型定位图片中的彩票区域、期号区域和号码区域。
3.  **文本识别 (Recognition)**：对定位到的区域进行 OCR 识别，提取期号和彩票号码。
4.  **中奖核对 (Checking)**：根据识别到的期号，自动联网查询开奖结果，并与识别到的号码进行比对。
5.  **结果输出**：返回识别结果及详细的中奖情况。

## 📦 安装与部署

### 本地安装

1.  克隆项目：
    ```bash
    git clone https://github.com/wushidiguo/hello-lottery.git
    cd hello-lottery
    ```

2.  安装依赖：
    ```bash
    pip install -r requirements.txt
    ```

### Docker 部署

```bash
# 构建镜像
docker build -t hello-lottery .

# 运行容器
docker run -d -p 5002:5002 hello-lottery
```

## 🚀 使用指南

### 1. 启动 Web 界面 (Gradio)

适合单人交互测试。

```bash
python app.py
```
启动后访问显示的本地地址 (通常为 `http://127.0.0.1:7860`)。

### 2. 启动 API 服务 (Flask)

适合作为后端服务调用。

```bash
python main.py
```
服务默认运行在 `7860` 端口 (可在 `main.py` 中修改)。

## 🔌 API 参考

### `/predict` (POST)
上传图片文件进行识别。

*   **参数**: `file` (图片文件)
*   **返回**: JSON 格式的识别与中奖结果。

### `/base64` (POST)
上传 Base64 编码的图片数据进行识别。

*   **参数**: `image` (Base64 字符串)
*   **返回**: JSON 格式的识别与中奖结果。

### `/health` (GET)
健康检查接口。

*   **返回**: `{"status": "healthy", "code": 200}`

## 🏗️ 技术栈

*   **Web 框架**: Flask, Gradio
*   **深度学习**: PyTorch
*   **计算机视觉**: OpenCV
*   **其他**: NumPy, Pandas