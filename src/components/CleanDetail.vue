<template>
		<v-dialog :value.sync="visible" width="640" scrollable persistent>
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
					<v-btn text color="primary" @click.stop="printsteps">打印</v-btn>
					<v-btn text color="primary" @click.stop="closedialog">关闭</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
</template>

<script>
    import {fieldNames} from '../fields'
	import {trans} from '../trans'

    export default {
        data() {
            return {
            }
        },
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            row: {
                type: Object,
                default: () => null
            }
        },
        computed: {
            details() {
                if (!this.row || !this.row.Steps) return [];
                let r = Object.assign({}, this.row);
                delete r.Steps;
                const s = Object.entries(r);
                return s.map(a => [fieldNames[a[0]]||a[0], a[1]]);
            },
            steps() {
                return (this.row && this.row.Steps) ? JSON.parse(this.row.Steps) : [];
            }
        },
        methods: {
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
				let wind = window.open("",'newwindow', 'height=600, width=800, top=100, left=100, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no');
				let nod = wind.document.createElement("style");
				let str = "#prn td {font-size:10pt;}";
				nod.type = "text/css";
				nod.innerHTML = str;
				wind.document.getElementsByTagName("head")[0].appendChild(nod);
				wind.document.body.innerHTML = printHtml;
				wind.print();
            },
            closedialog() {
                this.$emit('update:visible', false);
            }
        }
    }
</script>
