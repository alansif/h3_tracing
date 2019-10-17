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

				<v-flex xs4 sm2 md1 align-self-end>
					<v-btn style="width:100%" color="primary" @click.stop="query">查询</v-btn>
				</v-flex>
				<v-flex xs4 sm2 md1 align-self-end>
					<v-btn style="width:100%" color="primary" :loading="loading" @click.stop="dlpdf">下载</v-btn>
				</v-flex>

			</v-layout>
		</v-container>
		<v-divider/>
		<v-data-table id="mtbl1" :headers="cols" :items="tableData" :items-per-page="15" @click:row="rowclick">
<!--
			<template v-slot:item.CYCLE="{ item }">
				<span :style="{color:getColor(item.CYCLE)}" class="caption">{{ item.CYCLE }}</span>
			</template>
-->
		</v-data-table>
		<CleanDetail :visible.sync="dialog" :row="row"/>
	</div>
</template>

<script>
	import fileDownload from 'js-file-download'
	import CleanDetail from '@/components/CleanDetail.vue'

    export default {
        data() {
            return {
				tableData: [],
				cols:[
                    {value:'mdvt.id', text:'id', width:60},
                    {value:'mdvt.CycleCompletionDate', text:'日期', width:90},
                    {value:'mdvt.Category', text:'类别', width:80},
                    {value:'PatientName', text:'客户姓名', width:100},
                    {value:'PatientID', text:'客户ID', width:100},
                    {value:'mdvt.EndoscopeType', text:'内镜型号', width:100},
                    {value:'mdvt.SerialNumber', text:'内镜ID', width:90},
                    {value:'MarrorCleanTime', text:'预处理始', width:100},
                    {value:'MarrorCleanStopTime', text:'预处理终', width:100},
                    {value:'MarrorCleanPerson', text:'预处理人', width:100},
                    {value:'CleanDetail', text:'洗消步骤', width:470},
                    {value:'CardName', text:'洗消人', width:100},
                ],
				date1: new Date().toISOString().substr(0, 10),
				datemenu1: false,
				date2: new Date().toISOString().substr(0, 10),
				datemenu2: false,
				dialog: false,
				row: {},
				loading: false
            }
        },
		methods: {
			query() {
				this.$axios.get('/api/v1/report',{params:{
						fromdate: this.date1,
						todate: this.date2
					}})
					.then(response => {
                        const d = response.data;
                        this.tableData = d;
					})
					.catch(error => {
						console.dir(error);
					});			
			},
			dlpdf() {
				this.loading = true;
				this.$axios.post('/api/v1/report/download',{
						fromdate: this.date1,
						todate: this.date2
					}, {responseType:'blob'})
					.then(response => {
						fileDownload(response.data, 'report.pdf');
					})
					.catch(error => {
						console.dir(error);
					})
					.finally(() => {
						this.loading = false;
					});			
			},
			rowclick(row) {
				this.dialog = true;
				this.row = row.mdvt;
			}
        },
		components: {
			CleanDetail
		}
	}
</script>

<style>
	#mtbl1 table {
		table-layout: fixed;
	}
	#mtbl1 td, #mtbl th {
		padding: 0 0 0 8px;
		font-family: verdana;
		font-size: 12px;
	}
	#mtbl1 td {
		overflow:hidden;
		text-overflow:ellipsis;
		white-space:nowrap;
	}
</style>