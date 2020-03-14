<template>
 <div>
     <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
     <!-- 卡片式图 -->
    <el-card class="box-card">
        <!-- 输入框 -->
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getUserList">
                    <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
            </el-col>
        </el-row>
        <!-- 用户列表 -->
        <el-table :data="userlist" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="姓名" prop="username"></el-table-column>
            <el-table-column label="邮件" prop="email"></el-table-column>
            <el-table-column label="电话" prop="mobile"></el-table-column>
            <el-table-column label="角色" prop="role_name"></el-table-column>
            <el-table-column label="状态" prop="mg_state">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.mg_state" @change="userStatusChanged(scope.row)"></el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180px">
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                    <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                        <el-button type="warning" icon="el-icon-share" size="mini" @click="setRoles(scope.row)"></el-button>
                    </el-tooltip> 
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
         <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" 
         :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 3, 4]" :page-size="queryInfo.pagesize" 
         layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
        <!-- 内容主体 -->
        <el-form :model="addFrom" :rules="addFromRules" ref="addFormRef" label-width="70px">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="addFrom.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="addFrom.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="addFrom.email"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
                <el-input v-model="addFrom.mobile"></el-input>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogClose">重 置</el-button>
            <el-button @click="addDialogVisible = false" >取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <!-- 内容主体 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
            <el-form-item label="用户名">
                <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
                <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <!-- <el-button @click="editDialogClose">重 置</el-button> -->
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="edituserInfo">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRolesDialogVisible" width="50%" @close="setRolesDialogClosed">
        <!-- 内容主体 -->
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <el-select v-model="selectedRoleId" placeholder="请选择角色">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <!-- <el-button @click="editDialogClose">重 置</el-button> -->
            <el-button @click="setRolesDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
    </el-dialog>

 </div>
</template>

<script>
 export default {
  created () {
      this.getUserList()
  },
  data () {
    //   验证邮箱的正则表达式
   var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        // 合法邮箱
        return callback()
      }
      callback(new Error('请输入合法邮箱'))
    }
    // 自定义手机号规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      // 返回一个错误提示
      callback(new Error('请输入合法的手机号码'))
    }

   return {
       queryInfo: {
           query: '',
        //    当前的页数
           pagenum: 1,
        //    当前页数显示多少条数据
           pagesize: 2
       },
       userlist: [],
       total:0,
    //    控制添加用户对话框的显示和隐藏
       addDialogVisible:false,
    //    控制修改用户对话框的显示和隐藏
        editDialogVisible:false,
        // 所有角色的数据列表
        rolesList:{},
        // 已选中的角色ID值
        selectedRoleId:'',
    //    添加用户的表单数据
        addFrom: {
            username:'',
            password:'',
            email:'',
            mobile:''
        },
        editForm:{},
        // 控制分配权限对话框的显示和隐藏
        setRolesDialogVisible:false,
        // 需要被分配角色的用户信息
        userInfo:'',
        // 添加表单的验证规则对象
        addFromRules: {
            username: [
                {required: true, 
                message: '请输入用户名', trigger:'blur'},
                {min :3, max: 10, 
                message:'用户名的长度在3-10个字符之间',trigger:'blur'}
            ],
            password: [
                {required: true, 
                message: '请输入密码', trigger:'blur'},
                {min :6, max: 15, 
                message:'用户名的长度在6-15个字符之间',trigger:'blur'}
            ],
            email: [
                {required: true, 
                message: '请输入邮箱', trigger:'blur'},
                { validator: checkEmail, trigger: 'blur' }
            ],
            mobile: [
                {required: true, 
                message: '请输入手机号', trigger:'blur'},
                 { validator: checkMobile, trigger: 'blur' }
            ],
        },
        // 修改信息表单的验证规则对象
        editFormRules: {
            email: [
                {required: true, 
                message: '请输入邮箱', trigger:'blur'},
                { validator: checkEmail, trigger: 'blur' }
            ],
            mobile: [
                {required: true, 
                message: '请输入手机号', trigger:'blur'},
                 { validator: checkMobile, trigger: 'blur' }
            ],
        }
   }
  },
  methods: {
      async getUserList(){
          const {data: res} = await this.$http.get('users',{
              params:this.queryInfo
          })
          if (res.meta.status !== 200) {
              return this.$message.error('获取用户列表失败')
          }
          this.userlist = res.data.users
          this.total = res.data.total
          console.log(res);
          
      },
    //   监听pagesize改变的事件
      handleSizeChange(newSize){
          this.queryInfo.pagesize = newSize
          this.getUserList()
      },
    //   监听页码值改变的事件
    handleCurrentChange(newPage){
        this.queryInfo.pagenum = newPage
        this.getUserList()
    },
    async userStatusChanged(userinfo){
        console.log(userinfo);
        const {data: res} = await this.$http.put(
            `users/${userinfo.id}/state/$
            {userinfo.mg_state}`)
        if (res.meta.status !== 200) {
            userinfo.mg_state = !userinfo.mg_state
            return this.$message.error('更新用户状态失败')
        }
        this.$message.success('更新用户状态成功')
    },
    addDialogClose(){
        this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser(){
        this.$refs.addFormRef.validate(async vaild => {
            console.log(vaild);
            
            if(!vaild)return
            const {data: res} = await this.$http.post('users',this.addFrom)
            console.log(res);
            
            if(res.meta.status !==201){
                this.$message.error(res.meta.msg)
            }else{
                this.$message.success('添加用户成功')
                // 隐藏添加用户的对话框
                this.addDialogVisible = false
                this.getUserList()
            }
        })
    },
    async showEditDialog(id){
        const {data: res} = await this.$http.get(
            `users/`+id)
        if (res.meta.status !== 200) {
            return this.$message.error('查询用户信息失败')
        }
        console.log(res);
        this.editForm = res.data
        this.editDialogVisible = true
    },
    // 修改表单对话框关闭后重置biaodan
    editDialogClosed(){
        this.$refs.editFormRef.resetFields()
    },
    edituserInfo(){
        this.$refs.editFormRef.validate(async vaild => {
            if(!vaild)return
            //发起修改用户信息的数据请求
            const {data: res} = await this.$http.put(
                'users/'+this.editForm.id,
                {email: this.editForm.email,
                mobile: this.editForm.mobile}
            )
            if(res.meta.status !== 200) {
                return this.$message.error('更新用户信息失败')
            }
            // 关闭对话框
            this.editDialogVisible = false
            // 刷新数据列表
            this.getUserList()
            // 提示修改成功
            this.$message.success('更新用户信息成功')
        })
    },
    // 根据ID删除对应的用户信息
    async removeUserById(id) {
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
            const {data: res} = await this.$http.delete('users/'+id)
            if (res.meta.status !== 200) {
                return this.$message.error('删除用户失败')
            }

            this.$message.success('删除用户成功')
            this.getUserList()
    },
    async setRoles(userInfo) {
        this.userInfo = userInfo

        // 在展示对话框之前，获取所有的角色列表
        const {data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) {
            return this.$message.error('获取角色列表失败')
        }
        this.rolesList = res.data
        console.log(this.rolesList);
        
        this.setRolesDialogVisible = true
    },
    async saveRoleInfo() {
        if(!this.selectedRoleId) {
            return this.$message.error('请选择要分配的角色')
        }

        const {data: res} = await this.$http.put(
            `users/${this.userInfo.id}/role`,
            {
                rid: this.selectedRoleId
            }
        )
        if (res.meta.status !== 200) {
            return this.$message.error('更新角色失败')
        }
        this.$message.success('更新角色成功')
        this.getUserList()
        this.setRolesDialogVisible = false
    },
    setRolesDialogClosed() {
        this.selectedRoleId = ''
        this.userInfo = {}
    }
  },
  
 }
</script>

<style scoped>

 
</style>
