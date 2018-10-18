<template>
   <div>
   <br class='is-hidden-touch'>
      <section class='section'>
         <div class="container">
            <h1 class="title has-text-left has-text-white">
               FoxPermissions
            </h1>
            <div class="is-divider"></div>
         </div>
         <div class="container">
            <p class="has-text-left">The majority of Mr.Fox's commands are based off of a permissions structure. If a user wants to run a command that needs elevated privledges, they have to be assigned a permission via a role or themselves directly.</p>
            <p class="has-text-left">For example, if Eric wanted to ban someone from the server, he would need the <strong class="has-text-white">mod.banhammer</strong> permission assigned to a role he has role or himself directly, using either the setperm command in-server or the online dashboard.</p>
         </div>
      </section>
      <section class="section">
         <div class='container'>
            <h1 class="title has-text-centered has-text-white">Permissions List</h1>
            <div class="is-divider"></div>
            <div class="columns is-centered">
					<div class="column is-one-third">	
						<div class="box">
							<h1 class="title has-text-white">
							Select Category
						</h1>
							<aside class="menu">
								<ul class="menu-list">
    							<li class="has-text-centered" :key="category" v-for="(cmd, category) of permissions"><a @click="scrollTo(category)" :class="{ 'is-active':  activeCat === category }"><p class="has-text-white">{{ category }} </p></a></li>
  								</ul>
							</aside>
						</div>			
					</div>
                    <div class="column is-half">
						<div class="box">
							<h1 class="title has-text-white has-text-centered">
								{{ activeCat }}
							</h1>
							<div class="content">
								<b-table :mobile-cards="false" :paginated="willPaginate(activeCat)"
                                per-page="7"
                                :current-page.sync="activePage"
                                :pagination-simple="true" class="has-text-black" :data="permissions[activeCat]" :columns="columns"></b-table>	
							</div>
						</div>
					</div>
				</div>
         </div>
      </section>
      <section class="section">
         <div class="container">
            <p class="title has-text-left has-text-white">Configuring a permission for a user/role</p>
            <div class="is-divider"></div>
         </div>
         <div class="container">
            <div class="columns">
                  <div class="column">
                     <p class="subtitle has-text-white">Web Dashboard (Recommended)</p>
                    <b-message type="is-primary">
                    <p>To configure permissions on the dashboard, simply log in, select your server, and navigate to the <strong class="has-text-white">Permissions</strong> tab.</p>
                    <br>
                    <p>Here, add a new permissions role, or edit a permission role that you already have. From there, it's as simple as selecting your desired category, and choosing the option for your permission.</p>
                    </b-message>
                    <b-message type="is-warning">
                        <p class="has-text-white">Note about permissions: Permissions assigned to a role will override any permissions that may be configured to the @everyone role.</p>
                    </b-message>
                    <b-message type="is-warning">
                        <p class="has-text-white">At this time, the User scope is not available from the dashboard, and must be configured in-server.</p>
                    </b-message>
                  </div>
                  <div class="column">
                    <br><br>
                     <img align="right" id="columnimg" :src="require('../assets/permselector.png')">		
                  </div>
               </div>
         </div>
         <br>
         <div class="container">
             <div class="columns">
                  <div class="column">
                     <p class="subtitle has-text-white">In-server</p>
                     <b-message type="is-primary">
                           <p>To configure permissions from your Discord server, you can make use of the <strong class="has-text-white">setperm</strong> command. You will need the core.manageperm command to do so.</p>
                     <br>
                     <p>
                        <strong class='has-text-white'>permission</strong> - The permission code for the permission you want. We'll use <strong class='has-text-white'>mod.kickboot</strong>.
                     </p>
                     <br>
                     <p>
                        <strong class='has-text-white'>boolean</strong> - True or false. True means that you want them to have the permission, while false means you don't want them to have the permission.
                     </p>
                     <br>
                     <p>
                        <strong class='has-text-white'>target</strong> - The specific user or role that you want to assign the permission to. Can be a role/user name, a mention, or an ID.
                     </p>
                     </b-message>
                  </div>
                  <div class="column">
                      <br><br>
                     <img id="columnimg" align="right" :src="require('../assets/setpermcmd.png')">		
                  </div>
               </div>
         </div>
      </section>
   </div>
</template>
<script>
import API from "../API.js";
export default {
	auth: false,
	head() {
		return {
			title: 'Mr.Fox Bot - Permissions',
			meta: [
				{ hid: 'description', name: 'description', content: `A detailed guide to all of Mr.Fox Bot's modular permissions system, and how to configure permissions in your Discord server. `}
			]
		}
	},
    data() {
        return {
            activeCat: 'Automod',
            activePage: 1,
            columns: [{
				field: 'name',
				label: 'Name'
			}, {
				field: 'description',
				label: 'Description',	
			}],
            permissions: null
        };
    },
    async asyncData({ params, app }) {
        const { data: permissions } = await app.$axios.get('/api/permissions');
        return {
            permissions
        }
    },
    methods: {
        willPaginate(category) {
            return this.permissions[category].length >=7;
        },
        scrollTo(category) {
            this.activeCat = category;
            this.activePage = 1; 
        }
    }
}
</script>

<style>
#columnimg {
	border-radius: 25px;
	border: 5px solid #242424
}

.message-body {
    background-color: #242424
}
th {
    background-color: #34383c
}

td {
    background-color: #34383c;
	color: #eff;
    
}

 td span {
     color: #eff
        
    }

.th-wrap {
   color: #eff
        
    }
    .content table td {
    border-color: #242424
    
}

.content table th {
    border-color: #242424
}

</style>
