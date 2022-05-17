import { ILayout } from './ILayout';
import { INavigationMenu } from './INavigationMenu';
import { INavigator } from './INavigator';
/**
 * 系统
 */
export interface ISystem {
	// 登录
	login(): void;
	// 退出登录
	logout(): void;
	// 切换语言
	switchLang(lang: string): Promise<void>;
	// 刷新当前页面
	freshCurrentPage(): void;
	// 获取导航器
	getNavigator(): INavigator;
	// 获取导航菜单
	getNavigatorMenu(): INavigationMenu;
	// 获取布局
	getLayout(): ILayout;
}