<template>
 <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
        <el-row>
            <el-col>
                <el-button type="primary" @click="showAddCateList">添加分类</el-button>
            </el-col>
        </el-row>
        <!-- 表格站位 -->
        <tree-table class="treeTable" :data="catelist" :columns="columns"
        :selection-type="false" :expand-type="false"
        show-index index-text="#" border >
        <template slot="isok" slot-scope="scope">
            <i class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen;"></i>
            <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <template slot="order" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="cateEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="catedelectDialog(scope.row.cat_id)">删除</el-button>
        </template>
        </tree-table>
        <!-- 分页区 -->
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[1, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addcateDialogVisible" width="50%" @close="addcateDialogClosed">
        <!-- 内容主体 -->
        <el-form :model="addcateFrom" :rules="addcateFromRules" ref="addcateFormRef" label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
                <el-input v-model="addcateFrom.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类">
                <!-- options绑定数据源-->
                <!-- props用来指定配置对象 -->
                <el-cascader v-model="selectedKeys" 
                :options="parentCateList" 
                :props="{ expandTrigger: 'hover',
                          value:'cat_id',
                          label:'cat_name',
                          children:'children'}"
                @change="parentCateChange" clearable change-on-select></el-cascader>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addcateDialogVisible = false" >取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 修改分类名称的对话框 -->
    <el-dialog
      title="修改分类名称"
      :visible.sync="cateeditDialogVisible"
      width="50%" @close="editcateDialogClosed">
      <!-- 内容主体 -->
      <el-form
        :model="editCateForm"
        ref="editCateFormRef"
        :rules="editCateFormRules"
        label-width="100px">
        <el-form-item label="角色名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="cateeditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
 </div>
</template>

<script>
 export default {
  name: '',
  data () {
   return {
    //    商品分类的数据列表，默认为空
       catelist: [],
    // 查询条目设置
    querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
    },
    // 商品条目总数
    total:0,
    columns:[
        {
            // 第一列的标题名称
            label: '分类名称',
            // 对应的数据项
            prop: 'cat_name'
        },
        {
            // 第二列的标题名称
            label: '是否有效',
            // 表示，将当前列定义为模板列
            type: 'template',
            // 便是当前这列使用的模板名称
            template: 'isok',
        },
        {
            // 第三列的标题名称
            label: '排序',
            // 表示，将当前列定义为模板列
            type: 'template',
            // 便是当前这列使用的模板名称
            template: 'order',
        },
        {
            // 第四列的标题名称
            label: '操作',
            // 表示，将当前列定义为模板列
            type: 'template',
            // 便是当前这列使用的模板名称
            template: 'opt',
        }
    ],
    // 控制添加分类对话框的出现和隐藏
    addcateDialogVisible:false,
    // 控制修改分类对话框的出现和隐藏
    cateeditDialogVisible: false,
    // 添加分类的列表
    addcateFrom: {
        // 要添加分类的名臣
        cat_name:'',
        // 父级分类的ID
        cat_pid: 0,
        // 分类的等级，不填则为1级分类
        cat_level:0
    },
    addcateFromRules:{
        cat_name: [
            { required: true, message:'请输入分类名称',trigger: 'blur'}
        ]
    },
    // 父级分类列表
    parentCateList:[],
    // 选中的父级分类的id数组
    selectedKeys:[],
    editCateForm:{
        cat_name:'',
        cat_id:''
    },
    editCateFormRules:{
        cat_name: [
            { required: true, message:'请输入修改的分类名称',trigger: 'blur'}
        ]
    }
   }
  },
  created() {
      this.getCateList()
  },
  methods: {
      async getCateList() {
          const {data: res} = await this.$http.get('categories',{
              params: this.querInfo
          })
          if(res.meta.status !== 200){
              return this.$message.error('获取商品分类失败');
          } 
          this.catelist = res.data.result
          this.total = res.data.total
          console.log(this.catelist);
      },
      handleSizeChange(newSize){
          this.querInfo.pagesize = newSize
          this.getCateList()
      },
      handleCurrentChange(newNum){
          this.querInfo.pagenum = newNum
          this.getCateList()
      },
    //   点击按钮，展示添加分类的对话框
    showAddCateList(){
        this.getParentCateList()
        this.addcateDialogVisible = true
    },
    // 获取父级分类的列表
    async getParentCateList() {
        const {data: res} = await this.$http.get('categories', {params: {type: 2}})
        if (res.meta.status !== 200){
          return this.$message.error('获取父级分类失败')
        }
        console.log(res.data);
        this.parentCateList = res.data
    },
    // 选择项发生改变触发这个函数
    parentCateChange() {
        // 选中则数组长度不为0，未选中昂为0
        if (this.selectedKeys.length > 0) {
            // 父级分类的id
            this.addcateFrom.cat_pid = this.selectedKeys[
                this.selectedKeys.length - 1
            ]
            // 当前分类的等级赋值
            this.addcateFrom.cat_level = this.selectedKeys.length
            return
            } else {
                this.addcateFrom.cat_pid = 0
                // 为当前分类的等级赋值
                this.addcateFrom.cat_level = 0
            }
    },
    // 点击按钮，添加新的分类
    addCate() {
        this.$refs.addcateFormRef.validate(async valid => {
            if(!valid) return
            const {data: res} = await this.$http.post(
                'categories',this.addcateFrom)
            if(res.meta.status !== 201){
                return this.$message.error('添加分类失败')
            }
            this.$message.success('添加分类成功')
            this.getCateList()
            this.addcateDialogVisible = false
        })
        
    },
    addcateDialogClosed() {
        this.$refs.addcateFormRef.resetFields()
        this.selectedKeys = []
        this.addcateFrom.cat_level = 0
        this.addcateFrom.cat_pid = 0
    },
    cateEditDialog(id){
        this.editCateForm.cat_id = id
        this.cateeditDialogVisible = true
    },
    // 修改分类名称
    editCate() {
        this.$refs.editCateFormRef.validate(async valid => {
            if(!valid) return
            const {data: res} = await this.$http.put(
                'categories/'+this.editCateForm.cat_id,
                {cat_name:this.editCateForm.cat_name});
            
            if(res.meta.status !== 200){
                return this.$message.error('修改分类名称失败')
            }
            this.$message.success('修改分类名称成功')
            this.getCateList()
            this.cateeditDialogVisible = false
        })
    },
    editcateDialogClosed() {
        this.editCateForm.cat_name = ''
        this.editCateForm.id = ''
    },
    async catedelectDialog(id) {
        const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 点击确定 返回值为：confirm
      // 点击取消 返回值为： cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败！')
      this.$message.success('删除分类成功！')
      this.getCateList()
    }
  }
}
</script>

<style scoped>
.treeTable {
    margin-top:15px ;
}
 
</style>
