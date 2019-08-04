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
					<v-select v-model="endoscope" :items="endoscopes" label="内镜ID" hide-details placeholder="全部" clearable/>
				</v-flex>

				<v-flex xs6 sm4 md2 align-self-end>
					<v-btn color="primary" @click.stop="query">查询</v-btn>
				</v-flex>

			</v-layout>
		</v-container>
		<v-divider/>
		<v-data-table id="mtbl" :headers="cols" :items="tableData" :items-per-page="15" @click:row="rowclick">
			<template v-slot:item.CYCLE="{ item }">
				<span :style="{color:getColor(item.CYCLE)}" class="caption">{{ item.CYCLE }}</span>
			</template>
		</v-data-table>
		<v-dialog v-model="dialog" width="640" scrollable>
			<v-card>
				<v-card-title class="title grey lighten-2" dense>洗消循环明细</v-card-title>
				<v-card-text style="height: 800px" id="stepstable">
					<div style="font-family: verdana" id="prn">
						
						<v-simple-table dense>
							<tbody>
								<tr v-for="item in details" :key="item[0]">
									<td style="width:160px">{{ item[0] }}</td>
									<td>{{ item[1] }}</td>
								</tr>
							</tbody>
						</v-simple-table>
						<v-divider></v-divider>
						<v-simple-table dense>
							<thead>
								<tr>
									<th style="text-align:left">时间</th>
									<th style="text-align:left">步骤</th>
									<th>信息</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(item, index) in steps" :key="index">
									<td style="width:100px">{{ item.time }}</td>
									<td style="width:60px">{{ item.step }}</td>
									<td>{{ getTrans(item.info) }}</td>
								</tr>
							</tbody>
						</v-simple-table>
						
					</div>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text color="primary" @click="printsteps">打印</v-btn>
					<v-btn text color="primary" @click="dialog = false">关闭</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
	import {fieldNames} from '../fields'
	import {trans} from '../trans'

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
				endoscopes: [],
				tableData: [],
				cols:[],
				machine: [],
				endoscope: '',
				date1: new Date().toISOString().substr(0, 10),
				datemenu1: false,
				date2: new Date().toISOString().substr(0, 10),
				datemenu2: false,
				cleanstates: [
					{text:'全部', value:""},
					{text:'通过', value:"PASS"},
					{text:'失败', value:"FAIL"},
				],
				cleanstate: "",
				dialog: false,
				details: [],
				steps: []
            }
        },
        mounted() {
			this.fieldNames = fieldNames;
			this.$axios.get('/api/v1/machines')
				.then(response => {
					this.machines = response.data;
				})
				.catch(error => {
					console.dir(error);
				});
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
				this.$axios.get('/api/v1/query',{params:{
						fromdate: this.date1,
						todate: this.date2,
						CYCLE: this.cleanstate,
						machine: this.machine,
						endoscope: this.endoscope
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
						this.cols.push({value:k, text:this.fieldNames[k]||k, width: len * 8 + 20});
					}
					this.tableData = d;
				} else {
					this.tableData = [];
				}
			},
			getColor(c) {
				if (c === 'PASS') return "lime"
				else if (c === 'FAIL') return "red"
				else return "blue"
			},
			rowclick(row) {
				this.dialog = true;
				let r = Object.assign({}, row);
				delete r.Steps;
				const s = Object.entries(r);
				this.details = s.map(a => [this.fieldNames[a[0]]||a[0], a[1]]);
				this.steps = JSON.parse(row.Steps);
			},
			getTrans(info) {
				for (let n in trans) {
					if (info.includes(n)) {
						return info.replace(n, trans[n]);
					}
				}
				return info;
			},
			printsteps() {
				let printHtml = document.getElementById("stepstable").innerHTML;
				let wind = window.open("",'newwindow', 'height=300, width=700, top=100, left=100, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no');
				let nod = wind.document.createElement("style");
				let str = "#prn td {font-size:10pt;}";
				nod.type = "text/css";
				nod.innerHTML = str;
				wind.document.getElementsByTagName("head")[0].appendChild(nod);
				wind.document.body.innerHTML = printHtml;
				console.dir(wind.document.head);
				wind.print();
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