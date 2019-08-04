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
		<v-timeline align-top :dense="$vuetify.breakpoint.smAndDown" reverse style="width:800px;margin-left:40px;">
			<template v-for="(item, i) in items">
				<v-timeline-item :color="item[0].color" :icon="item[0].icon" fill-dot>
					<v-card :color="item[0].color" dark>
						<v-card-title class="subtitle-1 justify-end">{{item[0].title + '　' + item[0].date + ' ' + item[0].time}}</v-card-title>
						<v-divider/>
						<v-card-text class="white text--primary">
							<v-layout>
								<v-flex align-self-center>{{item[0].content}}</v-flex>
								<v-spacer/>
								<v-btn :color="item[0].color" class="mx-0" outlined @click.stop="showdetail(item[0].data)">详情</v-btn>
							</v-layout>
						</v-card-text>
					</v-card>
				</v-timeline-item>
				<v-timeline-item :color="item[1].color" small>
					<v-card :color="item[1].color" dark>
						<v-card-title class="subtitle-1">{{item[1].date + ' ' + item[1].time + '　' + item[1].title}}</v-card-title>
						<v-divider/>
						<v-card-text class="white text--primary">
							<v-layout>
								<v-flex align-self-center>{{item[1].content}}</v-flex>
								<v-spacer/>
								<v-btn :color="item[1].color" class="mx-0" outlined @click.stop="showdetail(item[1].data)">详情</v-btn>
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
		},
		showdata(d) {
			const r = d.map(x => {
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
					content: '洗消设备ID:　' + x.MachineSerialNumber,
					data: x
				},
				{
					title: '洗消结束',
					date: x.CycleCompletionDate,
					time: x.TimeEnd,
					color: x.CYCLE === 'FAIL' ? 'red lighten-2' : 'green lighten-1',
					content: `洗消时长:　 ${m}分${s}秒`,
					data: x
				}];
				return a;
			});
			this.items = r;
		},
		showdetail(row) {
			this.dialog = true;
			this.row = row;
		}
	}
}
</script>