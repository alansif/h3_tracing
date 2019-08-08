<template>
	<div>
		<v-container grid-list-md>
			<v-layout wrap style="line-height:0px">
				<v-flex xs6 sm4 md2>
				<v-menu
					v-model="datemenu1"
					transition="scale-transition"
					offset-y
					max-width="290"
				>
					<template v-slot:activator="{ on }">
					<v-text-field
						v-model="date1"
						label="开始日期"
						prepend-inner-icon="event"
						readonly
						hide-details
						v-on="on"
					></v-text-field>
					</template>
					<v-date-picker v-model="date1" @input="datemenu1 = false"></v-date-picker>
				</v-menu>
				</v-flex>
				<v-flex xs6 sm4 md2>
				<v-menu
					v-model="datemenu2"
					transition="scale-transition"
					offset-y
					max-width="290"
				>
					<template v-slot:activator="{ on }">
					<v-text-field
						v-model="date2"
						label="截止日期"
						prepend-inner-icon="event"
						readonly
						hide-details
						v-on="on" 
					></v-text-field>
					</template>
					<v-date-picker v-model="date2" @input="datemenu2 = false"></v-date-picker>
				</v-menu>
				</v-flex>
				<v-flex xs6 sm4 md2>
					<v-select v-model="endoscope" :items="endoscopes" label="内镜ID" hide-details placeholder="全部"/>
				</v-flex>
				<v-flex xs6 sm4 md2 align-self-end>
					<v-btn color="primary" @click.stop="query">查询</v-btn>
				</v-flex>
			</v-layout>
		</v-container>
		<v-divider/>
		<v-timeline align-top :dense="$vuetify.breakpoint.smAndDown" style="width:750px;margin-left:40px;">
			<template v-for="(item, i) in items">
				<v-timeline-item :color="item.apprn.color" :icon="item.apprn.icon"
					:fill-dot="!!item.apprn.icon"
					:small="!item.apprn.icon"
					:left="item.apprn.side==='left'"
					:right="item.apprn.side==='right'">
					<v-card :color="item.apprn.color" dark>
						<v-card-title v-if="item.apprn.side==='left'" class="subtitle-1">
							<v-icon v-if="item.warning" color="yellow lighten-2">warning</v-icon>
							<v-spacer/>
							{{item.title + '　' + item.datetime.substring(0,19).replace('T', ' ')}}
						</v-card-title>
						<v-card-title v-else class="subtitle-1">
							{{item.datetime.substring(0,19).replace('T', ' ') + '　' + item.title}}
							<v-spacer/>
							<v-icon v-if="item.warning" color="yellow lighten-2">warning</v-icon>
						</v-card-title>
						<v-divider/>
						<v-card-text class="white text--primary">
							<v-layout wrap fill-height align-content-center>
								<v-flex xs10 xl10>
									<p v-for="cnt in item.contents" class="my-1">{{cnt}}</p>
								</v-flex>
								<v-flex v-if="!!item.data" xs2 xl2 align-self-end>
									<v-btn :color="item.apprn.color" class="mx-0" small outlined @click.stop="showdetail(item.data)">详情</v-btn>
								</v-flex>
							</v-layout>
						</v-card-text>
					</v-card>
				</v-timeline-item>
			</template>
		</v-timeline>
		<CleanDetail :visible.sync="dialog" :row="row"/>
		<v-snackbar v-model="snackbar" color="blue lighten-1">无符合条件的记录</v-snackbar>
	</div>
</template>

<script>
import CleanDetail from '@/components/CleanDetail.vue'

export default {
	data: () => ({
		date1: new Date().toISOString().substr(0, 10),
		datemenu1: false,
		date2: new Date().toISOString().substr(0, 10),
		datemenu2: false,
		items: [],
		endoscopes: [],
		endoscope: '',
		dialog: false,
		row: {},
		snackbar: false
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
			this.$axios.get('/api/v1/timeline',{params:{
					endoscope: this.endoscope,
					fromdate: this.date1,
					todate: this.date2
				}})
				.then(response => {
					this.items = response.data;
					this.items.forEach(e => {e.apprn = this.getApprn(e.stage)});
					if (this.items.length === 0) this.snackbar = true;
				})
				.catch(error => {
					console.dir(error);
				});
		},
/*		showdata(d) {
			const r = d.flatMap(x => {
				let dif = Date.parse(x.CycleCompletionDate+'T'+x.TimeEnd) - Date.parse(x.CycleCompletionDate+'T'+x.TimeBegin);
				dif /= 1000;
				let m = Math.floor(dif / 60);
				let s = dif % 60;
				let a = `洗消时长:　 ${m}分${s}秒`;
			});
		},*/
		getApprn(stage) {
			const apprns = [
				{},
				{side:'left', color:'lime', icon:'mdi-zodiac-aquarius'},
				{side:'left', color:'cyan lighten-1', icon:'mdi-wiper-wash'},
				{side:'right', color:'green accent-4', icon:'mdi-doctor'},
				{side:'right', color:'amber accent-4'},
			];
			return apprns[stage];
		},
		showdetail(row) {
			this.dialog = true;
			this.row = row;
		}
	}
}
</script>