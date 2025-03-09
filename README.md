# summer
Summer 项目是一个基于TypeScript 的前端开发框架，借鉴了 Spring 框架的思想，提供了一套模块化、可扩展的前端基础库。通过依赖注入、事件驱动和组件化设计，简化了前端开发的复杂度，提高了代码的可维护性和可扩展性。 

## 核心功能

1. **模块化设计**: 项目采用模块化设计，每个模块可以独立开发和加载。模块通过 `ModuleRegistry` 注册和管理。
2. **依赖注入**: 项目使用依赖注入（DI）模式，通过装饰器（如 `@Autowired`、`@Bean`）实现依赖注入，简化了对象的创建和管理。
3. **事件驱动**: 项目提供了事件服务（`EventService`），支持事件的发布和订阅，方便模块之间的通信。
4. **组件化**: 项目使用 Vue 3 进行组件化开发，组件可以通过 `UserComponentRegistry` 注册和管理。
5. **日志管理**: 项目提供了日志服务（`Logger` 和 `LoggerFactory`），支持日志的记录和输出，方便调试和监控。

## 示例代码

以下是项目的入口文件 `src/main.ts` 的示例代码：

```typescript
import { Summer } from './core/Summer';
import './modules/Modules';

const summer = new Summer('#app', { debug: true, modelType: 'DataProvider' });

console.log('summer >> ', summer);
