module.exports = {
	devServer: {
		// open: process.platform === 'darwin',
		// host: 'localhost',
		open: false, //配置自动启动浏览器 
		proxy: {
			'/api': {
					target: 'http://192.168.160.90:8665'
			} 
		}
	},
	transpileDependencies:['vuetify']
}