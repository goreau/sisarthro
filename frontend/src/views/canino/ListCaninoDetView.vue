<template>
  <div class="main-container">
    <div class="columns is-centered">
      <div class="column is-11">
        <div class="card">
          <header class="card-header">
            <p class="card-header-title is-centered">Animais Cadastrados</p>
            <button class="button is-primary is-outlined" @click="newCaptDet">
              <span class="icon">
                <font-awesome-icon icon="fa-solid fa-plus-circle" />
              </span>
              <span>Novo</span>
            </button>
          </header>
          <div class="card-content">
            <Loader v-if="isLoading" />
            <Message
              v-if="showMessage"
              @do-close="closeMessage"
              :msg="message"
              :type="type"
              :caption="caption"
            />
            <MyTable :tableData="dataTable" :columns="columns" :filtered="true" :exports="true"  :table-name="tableName"/>
          </div>
        </div>
        <div style="display: none">
          <span class="icon is-small is-left" name="coisa">
            <font-awesome-icon icon="fa-solid fa-edit" />
          </span>
          <span class="icon is-small is-left" name="coisa2">
            <font-awesome-icon icon="fa-solid fa-trash" />
          </span>
        </div>
      </div>
    </div>
  </div>
  <confirm-dialog ref="confirmDialog"></confirm-dialog>
</template>

<script>
import caninoService from "@/services/canino.service";
import MyTable from "@/components/forms/MyTable.vue";
import Loader from "@/components/general/Loader.vue";
import ConfirmDialog from '@/components/forms/ConfirmDialog.vue';
import Message from "@/components/general/Message.vue";

export default {
  name: "ListaCaninos",
  data() {
    return {
      dataTable: [],
      tableName: "canino_det",
      isLoading: false,
      message: "",
      caption: "",
      type: "",
      showMessage: false,
      columns: [],
      myspan: null,
      myspan2: null,
      master: null
    };
  },
  components: {
    MyTable,
    Loader,
    ConfirmDialog
  },
  methods: {
    newCaptDet() {
      this.$router.push(`/canino_det/${this.master}`);
    },
    editCapt(id) {
      this.$router.push(`/editCapt/${id}`);
    },
    getFormat(row) {
      return {
        "has-text-danger-dark": row.status == 1,
        "has-text-danger": row.status == 2,
        "has-text-info": row.status == 3,
        "has-text-success": row.status == 9,
        "has-text-info": row.status == 7,
      };
    },
  },
  mounted() {
    this.myspan = document.getElementsByName("coisa")[0];
    this.myspan2 = document.getElementsByName("coisa2")[0];
    //document.createElement('span');
    // this.myspan.innerHTML='<p>teste</p>';;

    this.isLoading = true;
    caninoService.getCaninosDet(this.master)
      .then((response) => {
        this.dataTable = response.data;
        this.isLoading = false;
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => (this.isLoading = false));

    this.columns = [
      { title: "Tipo", field: "tipo", minWidth: 200 },
      { title: "Nome", field: "nome", minWidth: 200 },
      { title: "Ano Nasc", field: "nascimento", minWidth: 200, responsive: 2, },
      { title: "Raça", field: "raca", minWidth: 200 },
      { title: "Sexo", field: "sexo", minWidth: 200, responsive: 3 },
      {
        title: "Ações", responsive: 0, minWidth: 200,
        formatter: (cell, formatterParams) => {
          const row = cell.getRow().getData();

          const btEdit = document.createElement("button");
          btEdit.type = "button";
          btEdit.title = "Editar";
          btEdit.style.cssText = "height: fit-content; margin-left: 1rem;";
          btEdit.classList.add("button", "is-primary", "is-outlined");
          btEdit.innerHTML = this.myspan.innerHTML;
          btEdit.addEventListener("click", () => {
            this.$router.push(`/editCaninoDet/${row.id_canino_det}`);
          });

          /* const teste = document.createElement('div'); 
              teste.classList.add('icon', 'is-small');
              teste.innerHTML='<span><font-awesome-icon icon=\"fa-solid fa-envelope\" /></span>';*/

          const btDel = document.createElement("button");
          btDel.type = "button";
          btDel.title = "Excluir";
          btDel.style.cssText = "height: fit-content; margin-left: 1rem;";
          btDel.classList.add("button", "is-danger", "is-outlined");
          btDel.innerHTML = this.myspan2.innerHTML;
          btDel.addEventListener("click", async () => {
            const ok = await this.$refs.confirmDialog.show({
                title: 'Excluir',
                message: 'Deseja mesmo excluir essa canino?',
                okButton: 'Confirmar',
            })
            if (ok) {
              caninoService.deleteDet(row.id_canino_det)
              .then(()=>{
                location.reload();
              })
              .catch((err)=>{
                this.message = err.message;//"Erro inserindo o registro! Verifique o preenchimento e tente novamente!";
                this.showMessage = true;
                this.type = "alert";
                this.caption = "Animais";
                setTimeout(() => (this.showMessage = false), 3000);
              })
            }
          });

          const buttonHolder = document.createElement("span");
          buttonHolder.appendChild(btEdit);
          buttonHolder.appendChild(btDel);

          return buttonHolder;
        },
      },
    ];
  },
  created() {
    this.master = this.$route.params.master;
  },
};
</script>

<style scoped>
.button {
  margin-right: 1rem;
}
</style>
