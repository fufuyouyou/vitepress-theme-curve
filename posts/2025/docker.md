---
title: Linux安装docker和docker-compose
tags: [docker]
categories: [运维笔记]
date: 2025-10-02
description: 本文主要记录docker及docker-compose在linux环境下的安装，包括在线、离线安装方式。
---

## docker
### 离线安装
1. 下载想要安装的docker软件版本：https://download.docker.com/linux/static/stable/x86_64/
2. 解压安装包
```bash
tar -xvzf docker-20.10.9.tgz
mv docker/* /usr/bin
```
3. 进入目录/etc/systemd/system/ ，创建并编辑文件 docker.service
```bash
cd /etc/systemd/system/
vi docker.service
```

```bash
# docker.service内容
[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
After=network-online.target firewalld.service
Wants=network-online.target
[Service]
Type=notify
ExecStart=/usr/bin/dockerd
ExecReload=/bin/kill -s HUP $MAINPID
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
TimeoutStartSec=0
Delegate=yes
KillMode=process
Restart=on-failure
StartLimitBurst=3
StartLimitInterval=60s
[Install]
WantedBy=multi-user.target
```
4. 启动docker
```bash
# 重启daemon进程
systemctl daemon-reload
systemctl start docker
systemctl enable docker
```

### 在线安装
1. 卸载旧版
```bash
yum remove docker \
              docker-client \
              docker-client-latest \
              docker-common \
              docker-latest \
              docker-latest-logrotate \
              docker-logrotate \
              docker-selinux \
              docker-engine-selinux \
              docker-engine \
              docker-ce
```
2. 安装yum工具
```bash
yum install -y yum-utils \
              device-mapper-persistent-data \
              lvm2 --skip-broken
```
3. 更新本地yum镜像源
```bash
# 设置docker镜像源
yum-config-manager \
  --add-repo \
  https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
  sed -i 's/download.docker.com/mirrors.aliyun.com/docker-ce/g' /etc/yum.repos.d/docker-ce.repo

# 安装前先更新yum软件包索引
yum makecache fast
```
4. 安装docker-ce
```bash
yum install -y docker-ce
systemctl start docker
systemctl enable docker
```
### 配置镜像加速

```bash
cd /etc/docker/
vi daemon.json
```

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://registry.docker-cn.com",
    "http://hub-mirror.c.163.com"
  ]
}
```

```bash
# 重启daemon进程
systemctl daemon-reload
# 重启docker
systemctl restart docker
```

## docker-compose
1. 下载对应版本二进制文件：https://github.com/docker/compose/releases
2. 增加执行权限
```bash
mv docker-compose-Linux-x86_64 /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```
3. 验证安装
```bash
docker-compose --version
```
