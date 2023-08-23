var knex = require("../database/connection");
var User = require("./User")

class Territorio{

    async getMunicipiosNo(id){
        try{
            var currUser = await User.getUser(id);
            var result = [];
            switch (currUser.role) {
                case 1:
                    result = await knex.select(["id_municipio","nome"]).table("municipio").orderBy('nome', 'asc');
                    break;
                case 2:
                    //TODO: pegar a regional do usuario  e apliicar o filtro
                    result = await knex.select(["id_municipio","nome"]).table("municipio").orderBy('nome', 'asc');
                    break;
                default:
                    result = await knex.select(["id_municipio","nome"]).table("municipio").where({id_municipio: currUser.id_municipio}).orderBy('nome', 'asc');
                    break;
            }
            
            return result;
        }catch(err){
            console.log(err);
            return [];
        }
    }

    async getCodsis(id){
        try{
            var currUser = await User.getUser(id);
            var result = [];
            switch (currUser.role) {
                case 1:
                    result = await knex.select(["id_municipio"])
                    .column(knex.raw("concat(to_char(id_municipio, '000'), ' - ', nome) as nome"))
                    .table("municipio").orderBy('id_municipio', 'asc');
                    break;
                case 2:
                    var terr = await this.getTerritorio(currUser.id_municipio);
                    var id_regional =  terr.id_regional;

                    result = await knex.select(["id_municipio"])
                    .column(knex.raw("concat(to_char(id_municipio, '000'), ' - ', nome) as nome"))
                    .table("municipio as m")
                    .join("territorio as t", "m.id_regional", '=' , "t.id_territorio")
                    .where({'t.id_territorio': id_regional})
                    .orderBy('m.id_municipio', 'asc');
                    break;
                default:
                    result = await knex.select(["id_municipio"])
                    .column(knex.raw("concat(to_char(id_municipio, '000'), ' - ', nome) as nome"))
                    .table("municipio").where({id_municipio: currUser.id_municipio}).orderBy('id_municipio', 'asc');
                    break;
            }
            
            return result;
        }catch(err){
            console.log(err);
            return [];
        }
    }

    async getMunicipios(id){
        try{
            var currUser = await User.getUser(id);
            var result = [];
            switch (currUser.role) {
                case 1:
                    result = await knex.select(["id_municipio","nome"]).table("municipio").orderBy('nome', 'asc');
                    break;
                case 2:
                    var terr = await this.getTerritorio(currUser.id_municipio);
                    var id_regional =  terr.id_regional;

                    result = await knex.select(["id_municipio","m.nome"])
                    .table("municipio as m")
                    .join("territorio as t", "m.id_regional", '=' , "t.id_territorio")
                    .where({'t.id_territorio': id_regional})
                    .orderBy('m.nome', 'asc');
                    break;
                default:
                    result = await knex.select(["id_municipio","nome"]).table("municipio").where({id_municipio: currUser.id_municipio}).orderBy('nome', 'asc');
                    break;
            }
            
            return result;
        }catch(err){
            console.log(err);
            return [];
        }
    }
    
    async getTerritorio(id){
        try{
            var result =  await knex.select(["id_municipio", "t1.id_territorio as id_regional", "t1.nome as regional", "t2.id_territorio as id_drs", "t2.nome as drs", "t3.id_territorio as id_colegiado", "t3.nome as colegiado"])
            .table("municipio as m")
            .join("territorio as t1", "m.id_regional", '=', "t1.id_territorio")
            .join("territorio as t2", "m.id_drs", '=', "t2.id_territorio") 
            .join("territorio as t3", "m.id_colegiado", '=', "t3.id_territorio")
            .where({'m.id_municipio': id}); 

            return result[0];
        }catch(err){
            console.log(err);
            return [];
        }
    }

    async getTerritorios(tipo, id){
        try{
            var user = await knex.select(['u.role','u.id_municipio','m.id_drs', 'm.id_regional','m.id_colegiado'])
            .table("usuario as u")
            .join("municipio as m", "u.id_municipio","=","m.id_municipio")
            .where({'u.id_usuario': id}).first();


            var result =  await knex.select(["t.id_territorio", "t.nome"])
            .table("territorio as t")
            .where('tipo', tipo)
            .modify(function(queryBuilder) {
                if (user.role == 2){
                    queryBuilder.where("t.regional", '=', user.id_regional)                   
                } else if (user.role == 3) {
                    if ( tipo == 1 ){
                        queryBuilder.where("t.regional", '=', user.id_regional)    
                    } else if ( tipo == 2 ) {
                        queryBuilder.where("t.id_territorio", '=', user.id_drs) 
                    } else {
                        queryBuilder.where("t.id_colegiado", '=', user.id_colegiado)    
                    }                   
                }
            }); 

            return result;
        }catch(err){
            console.log(err);
            return [];
        }
    }
}

module.exports = new Territorio();