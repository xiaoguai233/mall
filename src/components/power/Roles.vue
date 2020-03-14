<template>
 <div>
     <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
     <!-- 卡片视图 -->
    <el-card>
        <el-row>
            <el-col>
                <el-button type="primary" @click="rolesaddDialogVisible = true">添加角色</el-button>
            </el-col>
        </el-row>
        <!-- 角色列表区 -->
        <el-table :data="rolesList" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <!--el-row 行 -->
                    <el-row :class="['bdbottom',i1 === 0? 'bdtop':'','vcenter']" 
                    v-for="(item1, i1) in scope.row.children" :key="item1.id">
                        <!-- 渲染一级权限 -->
                        <!--el-col 列 -->
                        <el-col :span="5">
                            <el-tag>{{item1.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <!-- 渲染二级和三级权限 -->
                            
                        <el-col :span="19">
                            <el-row v-for="(item2, i2) in item1.children" 
                            :key="item2.id" :class="[i2 === 0?'':'bdtop','vcenter']">
                                <el-col :span="6">
                                    <el-tag type="success">{{item2.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <el-col :span="18">
                                   <el-tag type="warning" v-for="item3 in item2.children"
                                   :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit" @click="rolesEditDialog(scope.row.id)" >编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="rolesremoveDialog(scope.row.id)">删除</el-button>
                    <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
    <!-- 添加角色 -->
    <el-dialog title="添加角色" :visible.sync="rolesaddDialogVisible" width="50%"  @close="rolesDialogClosed">
      <!-- 内容主体 -->
      <el-form
        :model="addRolesForm"
        ref="addRolesFormRef"
        :rules="addRolesFormRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName" clearable></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rolesaddDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="roleseditDialogVisible"
      width="50%">
      <!-- 内容主体 -->
      <el-form
        :model="editRolesForm"
        ref="editRolesFormRef"
        :rules="editRolesFormRules"
        label-width="100px">

        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleseditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%" @close="setRightDialogClosed">
      <!-- 内容主体 -->
      <el-tree :data="setRightList" :props="treeProps" show-checkbox node-key="id"
      default-expand-all :default-checked-keys="defkeys" ref="treeRef"></el-tree>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
 </div>
</template>

<script>
 export default {
  name: '',
  data () {
   return {
    //    所有角色列表数据
    rolesList: [],
    //  角色添加
    addRolesForm: {
        roleName: '',
        roleDesc: ''
    },
    // 编辑时存储的表单数据
    editRolesForm: {},
    // 所有权限的数据
    setRightList: {},
    // 树形控件的属性绑定对象
    treeProps:{
        label: 'authName',
        children: 'children'
    },
    // 默认选中的节点ID值数组
    defkeys:[],
    addRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 15,
            message: '角色名称的长度在2～15个字',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 2,
            max: 18,
            message: '角色描述的长度在2～18个字',
            trigger: 'blur'
          }
        ]
    },
    editRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 15,
            message: '角色名称的长度在2～15个字',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 2,
            max: 18,
            message: '角色描述的长度在2～18个字',
            trigger: 'blur'
          }
        ]
    },
    rolesaddDialogVisible:false,
    roleseditDialogVisible: false,
    setRightDialogVisible: false,
    // 当前即将分配权限的角色id
    rolesId:''
   }
  },
  created(){
      this.getRolesList()
  },
  methods:{
    //   获取角色列表
      async getRolesList(){
          const {data: res} = await this.$http.get('roles')
          if (res.meta.status !== 200){
              return this.$message.error('获取角色列表失败')
          }
          this.rolesList = res.data
          console.log(res);
      },
    //   添加角色
      addRoles() {
           // 提交请求前，表单预验证
          this.$refs.addRolesFormRef.validate(async valid => {
            // 表单预校验失败
          if (!valid) return
          const {data: res} = await this.$http.post('roles',this.addRolesForm)
          if (res.meta.status !== 201){return this.$message.error('添加角色失败')}
          this.$message.success('添加角色成功')

          this.rolesaddDialogVisible = false
          this.getRolesList()
        })
      },
    //   添加角色对话框关闭后清空填写的内容
      rolesDialogClosed() {          
          this.addRolesForm = {}
      },
      async rolesEditDialog(id){
          const { data: res } = await this.$http.get('roles/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error('查询用户信息失败！')
          }
          
          this.editRolesForm = res.data
          this.roleseditDialogVisible = true
      },
      editRoles(){
          // 提交请求前，表单预验证
          this.$refs.editRolesFormRef.validate(async valid => {
            // 表单预校验失败
          if (!valid) return
          const {data: res} = await this.$http.put(
              'roles/' + this.editRolesForm.roleId,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc
          }
          )
          console.log(res.meta.status);
          if (res.meta.status !== 200){return this.$message.error('修改角色失败')}
          this.$message.success('修改角色成功')
          
          this.roleseditDialogVisible = false
          this.getRolesList()
        })
      },
    //   删除角色
      async rolesremoveDialog(id) {
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
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
      this.$message.success('删除角色成功！')
      this.getRolesList()
    },
    // 根据ID删除对应的权限
    async removeRightById(role,rigthId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
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
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rigthId}`)
    //   console.log(role,rigthId,res.meta.status);
      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')

      this.$message.success('删除权限成功！')
      this.getRolesList()
    },
    // 展示分配权限的对话框
    async showSetRightDialog(roles){
        this.rolesId = roles.id
        // 获取所有权限
        const {data:res } = await this.$http.get('rights/tree')
        if (res.meta.status !== 200){
            return this.$message.error('获取权限数据失败')
        }
        // 把获取到的权限保存
        this.setRightList = res.data
        // console.log(this.setRightList);
        // 递归获取三级节点的Id
        this.getLeafKeys(roles,this.defkeys)
        this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色所有三级权限下的ID，并保存在defkeys数组中。
    getLeafKeys(node, arr) {
        // 如果当前node节点不包含children属性，则是三级节点
        if (!node.children) {
            return arr.push(node.id)
        }
        node.children.forEach(item =>this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
        this.defkeys = []
    },
    // 点击确定为角色分配权限
    async allotRights() {
        const keys = [
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys(),
        ]
        const idStr = keys.join(',')
        
        const {data: res} = await this.$http.post(
            `roles/${this.rolesId}/rights`,{rids:idStr}
        )

        if (res.meta.status !== 200) {
            return this.$message.error('分配权限失败')
        }
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.setRightDialogVisible = false
    }
  }
 }
</script>

<style>
.el-tag {
    margin:7px;
}
.bdtop {
    border-top: 1px solid #eee
}
.bdbottom {
    border-bottom: 1px solid #eee
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>