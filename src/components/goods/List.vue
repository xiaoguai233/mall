<template>
 <div>
     <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
        <el-row :gutter="20">
           <el-col :span="8">
               <el-input placeholder="请输入内容" v-model="queryInfo.query" 
               clearable @clear="getGoodsList">
                    <el-button slot="append" icon="el-icon-search"
                    @click="getGoodsList" ></el-button>
                </el-input>
           </el-col>
           <el-col :span="4">
               <el-button type="primary" @click="goAddpage">添加商品</el-button>
           </el-col>
        </el-row>
        <!-- tab表格区 -->
        <el-table :data="goodslist" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="商品名称" prop="goods_name"></el-table-column>
            <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
            <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column> 
            <el-table-column label="创建时间" prop="add_time" width="140px">
                <template slot-scope="scope">
                    {{scope.row.add_time | dataFormat}}
                </template>
            </el-table-column>
            <el-table-column label="操作" prop="add_time" width="140px">
                <template slot-scope="scope" width="130px">
                    <el-button type="primary" icon="el-icon-edit" 
                    size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                    <el-button type="danger" icon="el-icon-delete" 
                    size="mini" @click="removebyId(scope.row.goods_id)"></el-button>
                </template>
            </el-table-column>  
        </el-table>
         <!-- 分页 -->
         <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" 
         :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" 
         layout="total, sizes, prev, pager, next, jumper" :total="total" background>
        </el-pagination>
    </el-card>
 </div>
</template>

<script>
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
           pagesize: 10
       },
    //    商品列表数组
       goodslist:[],
       total:0
   }
  },
  created(){
      this.getGoodsList()
  },
  methods:{
    //   根据分页获取相依的商品列表
      async getGoodsList() {
          const {data: res} = await this.$http.get('goods',{
              params:this.queryInfo
          })
          if (res.meta.status !== 200) {
              return this.$message.error('获取商品列表失败')
          }
          this.goodslist = res.data.goods
          this.total = res.data.total
          console.log(res.data);
      },
      //   监听pagesize改变的事件
      handleSizeChange(newSize){
          this.queryInfo.pagesize = newSize
          this.getGoodsList()
      },
      //   监听页码值改变的事件
      handleCurrentChange(newPage){
        this.queryInfo.pagenum = newPage
        this.getGoodsList()
      },
      async removebyId(id) {
          // 弹框是否删除该用户？
        const confirmResult = await this.$confirm(
            '此操作将永久删除该用户信息，是否继续？',
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)//return err
            // 按了确定，则返回字符串 comfirm，按了取消则是 cancel
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            // 进行删除操作
            const {data: res} = await this.$http.delete('goods/'+id)
            if (res.meta.status !== 200) {
                return this.$message.error('删除商品失败')
            }

            this.$message.success('删除商品成功')
            this.getGoodsList()
      },
      goAddpage() {
          this.$router.push('/goods/add')
      }

  }
 }
</script>

<style scoped>
 
</style>
