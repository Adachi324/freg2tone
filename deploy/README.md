# 自动发布

生产入口：https://43.142.118.254/music/ （跳转第一章）。原游戏在 /music/index.html。
推送 main 后 GitHub Actions 测试、构建、上传并原子切换。PR 只检查。可在 Actions 手动重新运行。

服务器：fretdeploy 无 sudo，只拥有 /srv/fret2tone；管理员维护 /usr/local/bin/fret2tone-activate。GitHub Secrets 为 DEPLOY_KEY / DEPLOY_KNOWN_HOSTS，均不入库。只需22端口允许Actions SSH连接，443用于访问；本机SSH已通，实际Actions连通性须由首次流水线确认。

网关：/etc/string-opengym/Caddyfile，string-opengym-ingress.service；/music/* 由 file_server提供，其余路由保持原服务。网关备份 /etc/string-opengym/Caddyfile.pre-fret2tone。配置修改先caddy validate，当前admin off需restart；普通代码部署不重启网关。

版本：/srv/fret2tone/releases/<SHA>，current软链，version.txt为构建来源SHA。健康检查失败自动恢复前版；保留旧目录供回滚。
手工回滚：在服务器确认目标SHA存在后，以fretdeploy将current.next软链指向该release，再用mv -Tf原子替换current，检查/music/version.txt与三页面。

本地默认base仍为/；生产构建 DEPLOY_BASE=/music/ npm --prefix app run build。所有静态页面内部链接使用相对路径。
