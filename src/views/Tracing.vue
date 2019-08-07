<template>
	<div>
		<v-container grid-list-md>
			<v-layout wrap style="line-height:0px">
				<v-flex xs6 sm4 md2>
					<v-select v-model="endoscope" :items="endoscopes" label="内镜ID" hide-details placeholder="全部"/>
				</v-flex>
				<v-flex xs6 sm4 md2 align-self-end>
					<v-btn color="primary" @click.stop="query">查询</v-btn>
				</v-flex>
			</v-layout>
		</v-container>
		<v-divider/>
		<v-timeline align-top :dense="$vuetify.breakpoint.smAndDown" style="width:800px;margin-left:40px;">
			<template v-for="(item, i) in items">
				<v-timeline-item :color="item.color" :icon="item.icon"
					:fill-dot="!item.small"
					:small="item.small"
					:left="item.side==='left'"
					:right="item.side==='right'">
					<v-card :color="item.color" dark>
						<v-card-title v-if="item.side==='left'" class="subtitle-1 justify-end">{{item.title + '　' + item.date + ' ' + item.time}}</v-card-title>
						<v-card-title v-else class="subtitle-1">{{item.date + ' ' + item.time + '　' + item.title}}</v-card-title>
						<v-divider/>
						<v-card-text class="white text--primary">
							<v-layout wrap fill-height align-content-center>
								<v-flex xs10 xl10>
									<p v-for="cnt in item.contents" class="my-1">{{cnt}}</p>
								</v-flex>
								<v-flex xs2 xl2 align-self-end>
									<v-btn :color="item.color" class="mx-0" small outlined @click.stop="showdetail(item.data)">详情</v-btn>
								</v-flex>
							</v-layout>
						</v-card-text>
					</v-card>
				</v-timeline-item>
			</template>
		</v-timeline>
		<CleanDetail :visible.sync="dialog" :row="row"/>
	</div>
</template>

<script>
import CleanDetail from '@/components/CleanDetail.vue'

export default {
	data: () => ({
		items: [],
		endoscopes: [],
		endoscope: '',
		dialog: false,
		row: {}
	}),
	components: {
		CleanDetail
	},
	mounted() {
		this.$axios.get('/api/v1/endoscopes')
			.then(response => {
				this.endoscopes = response.data;
			})
			.catch(error => {
				console.dir(error);
			});
	},
	methods: {
		query() {
			if (this.endoscope.length === 0) return;
			this.$axios.get('/api/v1/query',{params:{
					endoscope: this.endoscope
				}})
				.then(response => {
					const d = response.data;
					this.showdata(d);
				})
				.catch(error => {
					console.dir(error);
				});
			this.$axios.get('/api/v1/timeline',{params:{
					endoscope: this.endoscope
				}})
				.then(response => {
				})
				.catch(error => {
					console.dir(error);
				});
		},
		showdata(d) {
			const r = d.flatMap(x => {
				let dif = Date.parse(x.CycleCompletionDate+'T'+x.TimeEnd) - Date.parse(x.CycleCompletionDate+'T'+x.TimeBegin);
				dif /= 1000;
				let m = Math.floor(dif / 60);
				let s = dif % 60;
				let a = 
				[
				{
					title: '洗消开始',
					date: x.CycleCompletionDate,
					time: x.TimeBegin,
					color: x.CYCLE === 'FAIL' ? 'red lighten-2' : 'green lighten-1',
					icon: 'mdi-wiper-wash',
					contents: ['洗消设备ID:　' + x.MachineSerialNumber],
					data: x,
					side: "left",
					small: false
				},
				{
					title: '洗消结束',
					date: x.CycleCompletionDate,
					time: x.TimeEnd,
					color: x.CYCLE === 'FAIL' ? 'red lighten-2' : 'green lighten-1',
					contents: [`洗消时长:　 ${m}分${s}秒`],
					data: x,
					side: "right",
					small: true
				}];
				return a;
			});
			this.items = r;
		},
		showdata2(d) {
			const r = d.map(x => {

			});
		},
		showdetail(row) {
			this.dialog = true;
			this.row = row;
		}
	}
}
</script>