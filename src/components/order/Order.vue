<template>
 <div>
     <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="请输入内容" v-model="queryInfo.query" 
               clearable @clear="getOrderList">
                    <el-button slot="append" icon="el-icon-search"
                    @click="getOrderList" ></el-button>
                </el-input>
            </el-col>
        </el-row>
        <!-- 订单列表区 -->
        <el-table :data="orderlist" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="订单编号" prop="order_number"></el-table-column>
            <el-table-column label="订单价格(元)" prop="order_price"></el-table-column>
            <el-table-column label="是否付款" prop="pay_status">
                <template slot-scope="scope">
                    <el-tag type="success" v-if="scope.row.pay_status === 1">已付款</el-tag>
                    <el-tag type="danger" v-else>未付款</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="是否发货" prop="is_send" width="70px"></el-table-column>
            <el-table-column label="下单时间" prop="create_time" width="140px">
                <template slot-scope="scope">
                    {{scope.row.create_time | dataFormat}}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="140px">
                <template width="130px">
                    <el-button type="primary" icon="el-icon-edit" 
                    size="mini" @click="showBox"></el-button>
                    <el-button type="success" icon="el-icon-location" 
                    size="mini" @click="showProgress"></el-button>
                </template>
            </el-table-column>  
        </el-table>
        <!-- 分页 -->
         <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" 
         :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" 
         layout="total, sizes, prev, pager, next, jumper" :total="total" background>
        </el-pagination>
    </el-card>

    <!-- 修改地址的对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%" @close="addressDialogColsed">
      <!-- 内容主体 -->
      <el-form
        :model="addressForm"
        ref="addressFormRef"
        :rules="addressFormRules"
        label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
         <el-cascader :options="cityData" v-model="addressForm.address1">

         </el-cascader>
        </el-form-item>
         <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示物流进度的对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%">
      <!-- 内容主体 -->
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
 </div>
</template>

<script>
import cityData from './citydata.js'

 export default {
  name: '',
  data () {
   return {
       //    查询参数对象
       queryInfo: {
           query: '',
        //    当前的页数
           pagenum: 1,
        //    当前页数显示多少条数据
           pagesize: 5
       },
    //    订单列表数组
       orderlist:[],
       total:0,
       addressVisible:false,
       addressForm: {
           address1:[],
           address2:''
       },
       addressFormRules: {
           address1:[
               { required: true, message:'请选择省市区/县',trigger: 'blur'}
           ],
           address2:[
               { required: true, message:'请填写详细地址',trigger: 'blur'}
           ]
       },
       cityData,
       progressVisible:false,
       progressInfo:[]
       
   }
  },
  created() {
      this.getOrderList()
  },
  methods:{
      async getOrderList() {
          const {data: res} = await this.$http.get('orders',{
              params:this.queryInfo
          })
          if (res.meta.status !== 200) {
              return this.$message.error('获取订单列表失败')
          }
          this.orderlist = res.data.goods
          this.total = res.data.total
          console.log(res.data);
      },
      //   监听pagesize改变的事件
      handleSizeChange(newSize){
          this.queryInfo.pagesize = newSize
          this.getOrderList()
      },
      //   监听页码值改变的事件
      handleCurrentChange(newPage){
        this.queryInfo.pagenum = newPage
        this.getOrderList()
      },
    //   展示修改地址的对话框
      showBox() {
          this.addressVisible = true
      },
      addressDialogColsed() {
          this.$refs.addressFormRef.resetFields()
      },
      async showProgress() {
          // 供测试的物流单号：1106975712662
        const { data: res } = await this.$http.get('/kuaidi/1106975712662')
        if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败!')
        }
        this.progressInfo = res.data
        console.log(res.data);
        
        this.progressVisible = true
       }

  }
 }
</script>

<style scoped>
.el-cascader {
    width: 100%;
}
 
</style>
