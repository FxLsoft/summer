const ProxySummer = () => import('./core/Summer');

ProxySummer().then(module => {
    let summer = new module.Summer('#app', { debug: true, modelType: 'DataProvider' });
    (window as any).summer = summer;
});
