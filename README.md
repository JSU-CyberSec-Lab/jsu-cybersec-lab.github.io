# 吉首大学网络与信息安全课题组门户网站

吉首大学网络与信息安全课题组（JSU-CyberSec-Lab）官方网站源代码。网站用于展示课题组研究方向、研究成果、团队成员、招生合作信息与联系方式。

## 页面结构

| 页面 | 访问路径 | 源文件 |
| --- | --- | --- |
| 首页 | `/` | `index.html` |
| 研究方向 | `/research-directions/` | `research-directions/index.html` |
| 研究成果 | `/research-results/` | `research-results/index.html` |
| 团队成员 | `/team/` | `team/index.html` |
| 加入我们 | `/join-us/` | `join-us/index.html` |
| 联系我们 | `/contact/` | `contact/index.html` |

## 目录说明

```text
.
├── index.html                  # 首页
├── research-directions/       # 研究方向页
├── research-results/          # 研究成果页
├── team/                      # 团队成员页
├── join-us/                   # 加入我们页
├── contact/                   # 联系我们页
├── assets/
│   ├── css/site.css           # 全站共享样式
│   ├── js/                    # 全站交互、双语和地图脚本
│   └── images/                # 正式站点使用的图片（按用途分类）
│       ├── branding/          # 校徽、站点图标
│       ├── carousel/          # 首页轮播：书籍、期刊、奖项与研究方向
│       ├── news/              # 首页新闻图片
│       ├── team/              # 教师/成员照片及团队装饰图
│       ├── join-us/           # “加入我们”中的课题组日常图片
│       └── patents/           # 发明专利摘要附图
├── scripts/                   # 设计素材生成和维护脚本
├── archive/                   # 旧页面、未使用素材和设计源文件
└── backups/                   # 重要改版前的压缩备份
```

正式页面采用“页面目录 + 共享资源目录”的组织方式。各页面拥有独立入口，同时共用同一套样式、脚本和图片，便于维护且避免资源重复。

## 本地预览

在项目根目录运行：

```bash
python3 -m http.server 8765
```

然后访问 [http://127.0.0.1:8765/](http://127.0.0.1:8765/)。建议通过本地 HTTP 服务预览，不要直接双击 HTML；地图、目录链接以及部分浏览器安全策略在 HTTP 环境下更接近正式部署效果。

## 日常维护

- 页面文字与结构：编辑对应页面目录中的 `index.html`。
- 全站样式：编辑 `assets/css/site.css`。
- 中文/英文文案：编辑 `assets/js/i18n.js`，并同步检查 HTML 中的 `data-i18n` 标记。
- 轮播、展开面板等交互：编辑 `assets/js/common.js`。
- 联系页地图：编辑 `assets/js/amap-config.js` 和 `assets/js/contact-map.js`。
- 正式图片：按用途放入 `assets/images/` 下相应子目录，并使用相对于页面文件的路径引用；不再使用的素材移至 `archive/unused-assets/images/`，不要直接删除。

公开仓库中的 `assets/js/amap-config.js` 使用占位符，不保存真实凭证。正式部署时，请先在高德开放平台为 Web 端 Key 配置准确的域名白名单和最小化接口权限，再在部署版本中填写 `key` 与 `securityJsCode`。未配置凭证时，联系页会显示地图不可用提示，并保留“在地图中查看”的跳转入口。

## 部署

这是一个不依赖构建工具的静态网站。部署时上传项目根目录，并确保服务器：

1. 将根目录的 `index.html` 作为首页；
2. 支持目录默认文档 `index.html`；
3. 保留当前目录层级与文件名大小写；
4. 使用 UTF-8 和 HTTPS 提供页面。

## 归档与备份

- `archive/legacy-site/` 保存已退出正式导航的旧页面和旧样式；
- `archive/unused-assets/` 保存当前未被正式页面引用的素材；
- `archive/design-sources/` 保存设计过程中的源文件；
- `backups/` 保存重要改版前的压缩包。

归档内容不参与正式网站运行。确认长期无用后，可以在单独备份完成的前提下清理。

## 许可与素材权利

网站自研源代码按 [LICENSE](LICENSE) 中的 MIT 条款开放。校名校徽、人物照片、新闻图片、论文摘要、专利附图、书刊封面、第三方图标及其他非代码内容不在 MIT 授权范围内，其权利归吉首大学、课题组成员或相应权利人所有。

## 贡献者

| 贡献者 | 主要贡献 |
| --- | --- |
| [@kody1126](https://github.com/kody1126) | 网站核心设计、功能开发、内容建设与持续维护 |
| [@Hanl77](https://github.com/Hanl77) | 项目脚手架搭建与 UI 优化 |

感谢课题组成员在资料整理、内容校对与图片素材方面提供的支持。

## 相关链接

- [吉首大学](https://www.jsu.edu.cn/)
- [吉首大学计算机科学与工程学院](https://cse.jsu.edu.cn/)
- [JSU-CyberSec-Lab GitHub](https://github.com/JSU-CyberSec-Lab)
