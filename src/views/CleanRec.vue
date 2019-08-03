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
					<v-select v-model="cleanstate" :items="cleanstates" label="洗消状态" hide-details/>
				</v-flex>
				<v-flex xs6 sm4 md2>
					<v-select v-model="machine" :items="machines" label="设备ID" hide-details multiple placeholder="全部">
						<template v-slot:selection="{ item, index }">
							<span v-if="index === 0" class="caption">{{ item }}</span>
						<span
							v-if="index === 1"
							class="grey--text caption"
						>(+{{ machine.length - 1 }})</span>
						</template>
					</v-select>
				</v-flex>
				<v-flex xs6 sm4 md2>
					<v-select label="内镜ID" hide-details placeholder="全部"/>
				</v-flex>

				<v-flex xs6 sm4 md2 align-self-end>
					<v-btn color="primary" @click.stop="query">查询</v-btn>
				</v-flex>

			</v-layout>
		</v-container>
		<v-divider/>
		<v-data-table id="mtbl" :headers="cols" :items="tableData">
			<template v-slot:item.CYCLE="{ item }">
				<span :style="{color:getColor(item.CYCLE)}" class="caption">{{ item.CYCLE }}</span>
			</template>
		</v-data-table>
	</div>
</template>

<script>
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
				fieldNames: {},
				machines: [],
				tableData: [],
				cols:[],
				machine: [],
				date1: new Date().toISOString().substr(0, 10),
				datemenu1: false,
				date2: new Date().toISOString().substr(0, 10),
				datemenu2: false,
				cleanstates: [
					{text:'全部', value:""},
					{text:'通过', value:"PASS"},
					{text:'失败', value:"FAIL"},
				],
				cleanstate: ""
            }
        },
        mounted() {
			this.$axios.get('/api/v1/fieldnames')
				.then(response => {
					this.fieldNames = response.data;
				})
				.catch(error => {
					console.dir(error);
				});
			this.$axios.get('/api/v1/machines')
				.then(response => {
					this.machines = response.data;
				})
				.catch(error => {
					console.dir(error);
				});
		},
		methods: {
			query() {
				console.log(this.machine);
				this.$axios.get('/api/v1/query',{params:{
						fromdate: this.date1,
						todate: this.date2,
						CYCLE: this.cleanstate,
						machine: this.machine
					}})
					.then(response => {
						const d = response.data;
						this.showtable(d);
					})
					.catch(error => {
						console.dir(error);
					});			
			},
			showtable(d) {
				if (d.length > 0) {
					this.cols = [];
					for(let k in d[0]) {
						if (k === "Steps") continue;
						let headlen = getStringLen(this.fieldNames[k]||k);
						let a = d[0][k];
						let len = a ? getStringLen(a.toString()) : 4;
						if (len < headlen) len = headlen;
						if (len < 4) len = 4;
						if (len > 20) len = 20;
						if (k === "CYCLE") len = 10;
						this.cols.push({value:k, text:this.fieldNames[k]||k, width: len * 8 + 20});
					}
					this.tableData = d;
				} else {
					this.tableData = [];
				}
			},
			getColor(c) {
				if (c === 'PASS') return "green"
				else if (c === 'FAIL') return "red"
				else return "blue"
			}
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