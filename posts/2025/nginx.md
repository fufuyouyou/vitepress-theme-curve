---
title: Linux安装nginx
tags: [nginx]
categories: [运维笔记]
date: 2025-10-02
description: 本文主要记录nginx在linux环境下的安装。
---

## Linux安装nginx

### 更新系统

```bash
# CentOS 7使用yum
sudo yum update -y

# CentOS 8及以上使用dnf
sudo dnf update -y
```

### 包管理器安装
#### 安装Nginx

```bash
# CentOS 7
sudo yum install nginx -y

# CentOS 8及以上
sudo dnf install nginx -y
```

#### 启动Nginx并设置开机自启

```bash
# 启动Nginx服务
sudo systemctl start nginx

# 设置开机自启动
sudo systemctl enable nginx

# 查看服务状态（验证是否启动成功）
sudo systemctl status nginx
```

#### 配置防火墙（允许HTTP/HTTPS访问）

```bash
# 开放80端口（HTTP）
sudo firewall-cmd --zone=public --add-port=80/tcp --permanent

# 开放443端口（HTTPS，可选）
sudo firewall-cmd --zone=public --add-port=443/tcp --permanent

# 重新加载防火墙规则
sudo firewall-cmd --reload
```

### 源码编译安装
#### 安装依赖包

```bash
# CentOS 7
sudo yum install gcc pcre-devel zlib-devel openssl-devel wget -y

# CentOS 8及以上
sudo dnf install gcc pcre-devel zlib-devel openssl-devel wget -y
```

#### 下载Nginx源码包

```bash
# 进入临时目录
cd /tmp

# 下载源码包
wget http://nginx.org/download/nginx-1.25.2.tar.gz

# 解压
tar -zxvf nginx-1.25.2.tar.gz
cd nginx-1.25.2
```

#### 配置编译参数

```bash
# 基础配置（安装到/usr/local/nginx ，启用SSL模块）
sudo ./configure --prefix=/usr/local/nginx --with-http_ssl_module
```

#### 编译并安装

```bash
# 编译（-j4表示使用4个CPU核心加速编译，根据实际核心数调整）
sudo make -j4

# 安装
sudo make install
```

#### 创建系统服务

```bash
# 创建服务配置文件
sudo vi /usr/lib/systemd/system/nginx.service
```

```bash
[Unit]
Description=Nginx Web Server
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/nginx/sbin/nginx
ExecReload=/usr/local/nginx/sbin/nginx -s reload
ExecStop=/usr/local/nginx/sbin/nginx -s stop
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
# 保存退出后，重新加载服务配置
sudo systemctl daemon-reload
```

#### 启动Nginx并设置开机自启

```bash
# 启动服务
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 验证状态
sudo systemctl status nginx
```
