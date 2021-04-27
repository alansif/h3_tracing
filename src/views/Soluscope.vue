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

				<v-flex xs6 sm4 md2 align-self-end>
					<v-btn color="primary" @click.stop="query">查询</v-btn>
				</v-flex>

			</v-layout>
		</v-container>
		<v-divider/>
		<v-data-table id="mtbl" :headers="cols" :items="tableData" :items-per-page="15">
			<template v-slot:item.RetrieveDate="{ item }">
				{{formatTime(item.RetrieveDate)}}
			</template>
			<template v-slot:item.StartDate="{ item }">
				{{formatTime(item.StartDate)}}
			</template>
			<template v-slot:item.EndDate="{ item }">
				{{formatTime(item.EndDate)}}
			</template>
		</v-data-table>
	</div>
</template>

<script>
	function formatTime(t) {
		if (!t) return '';
		const time = new Date(t);
		const y = time.getFullYear();
		const m = time.getMonth() + 1;
		const d = time.getDate();
		const h = time.getHours();
		const mm = time.getMinutes();
		const s = time.getSeconds();
		const add0 = (m) => { return m < 10 ? '0' + m : m };
		return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
	}

    function getStringLen(str) {
        if (typeof str !== 'string') return 0;
        let l = str.length;
        let blen = 0;
        for(let i=0; i<l; i++) {
            if ((str.charCodeAt(i) & 0xff00) !== 0) {
                blen ++;
            }
            blen ++;
        }
        return blen;
	}

    export default {
        data() {
            return {
				tableData: [],
				cols:[],
				endoscope: '',
				date1: new Date().toISOString().substr(0, 10),
				datemenu1: false,
				date2: new Date().toISOString().substr(0, 10),
				datemenu2: false,
            }
        },
        mounted() {
			this.formatTime = formatTime;
        },
		methods: {
			query() {
				this.$axios.get('/api/v1/soluscope/query',{params:{
						fromdate: this.date1,
						todate: this.date2
					}})
					.then(response => {
						const d = response.data;
						this.showtable(d);
					})
					.catch(err => {
						console.error(err);
					});
			},
			showtable(d) {
				if (d.length > 0) {
					this.cols = [];
					for(let k in d[0]) {
						if (k === "Steps") continue;
						let headlen = getStringLen(k);
						let a = d[0][k];
						let len = a ? getStringLen(a.toString()) : 4;
						if (len < headlen) len = headlen;
						if (len < 4) len = 4;
						if (len > 20) len = 20;
						this.cols.push({value:k, text:k, width: len * 8 + 36});
					}
					this.tableData = d;
				} else {
					this.tableData = [];
				}
			},
		}
	}
</script>

<style>
	#mtbl table {
		table-layout: fixed;
	}
	#mtbl td, #mtbl th {
		padding: 0 0 0 8px;
		font-family: verdana;
		font-size: 12px;
	}
	#mtbl td {
		overflow:hidden;
		text-overflow:ellipsis;
		white-space:nowrap;
	}
</style>