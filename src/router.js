import Vue from 'vue'
import Router from 'vue-router'
import CleanRec from './views/CleanRec.vue'

Vue.use(Router)

const router = new Router({
	mode: 'history',
	base: process.env.BASE_URL,
	routes: [
		{
			path: '/',
			name: 'cleanrec',
			component: CleanRec
		},
		{
			path: '/tracing',
			name: 'tracing',
			// route level code-splitting
			// this generates a separate chunk (about.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import(/* webpackChunkName: "about" */ './views/Tracing.vue')
		}
	]
});

router.beforeEach((to, from, next) => {
    if(to.matched.some(res => res.meta.noAuth)||localStorage.getItem('username')){
		next();
    }
});

export default router;