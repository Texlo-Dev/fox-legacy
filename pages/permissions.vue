<template>
   <div>
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
            <h1 class="title has-text-left has-text-white">Permissions List</h1>
            <div class="is-divider"></div>
            <h1 v-for="(cmd, category) of permissions" class="subtitle has-text-left has-text-grey">
               {{ category }}
               <br><br>
               <div class="columns is-multiline">
                  <div v-for="perm of permissions[category]" class="column is-one-quarter">
                     <div class="box">
                        <div class="content">
                           <h4 class="subtitle has-text-white has-text-left">
                              {{ perm.name }}
                           </h4>
                           <p class='has-text-left has-text-white'>{{ perm.description }}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </h1>
         </div>
      </section>
      <section class="section">
         <div class="container">
            <p class="title has-text-left has-text-white">Configuring a permission for a user/role</p>
            <div class="is-divider"></div>
         </div>
         <div class="container">
            <section class="section">
               <div class="columns">
                  <div class="column">
                     <p class="subtitle has-text-white">Web Dashboard (Recommended)</p>
                     <p>To configure permissions on the dashboard, simply log in, select your server, and navigate to the <strong class="has-text-white">Permissions</strong> tab. Currently,the user scope is not available from the dashboard.</p>
                     <br>
                     <p><strong class="has-text-white">Available Scopes:</strong></p>
                     <p>user = only one person will have the permission. </p>
                     <p>role = Everyone who has the role will have the permission.</p>
                     <p>channeluser = a user will only have the permission in the current channel.</p>
                     <p>channelrole= People with the role will have the only have the permission in a certain channel.</p>
                     <br>
                  </div>
                  <div class="column">
                     <img id="columnimg" :src="require('../assets/permselector.png')">		
                  </div>
               </div>
            </section>
            <section class="section">
               <div class="columns">
                  <div class="column">
                     <p class="subtitle has-text-white">In-server</p>
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
                     <br>
                  </div>
                  <div class="column">
                     <img id="columnimg" :src="require('../assets/setpermcmd.png')">		
                  </div>
               </div>
            </section>
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
            permissions: null
        };
    },
    async asyncData({ params, app }) {
        const { data: permissions } = await app.$axios.get('/api/permissions');
        return {
            permissions
        }
    }
}
</script>

<style>
#columnimg {
	border-radius: 25px;
	border: 5px solid #242424
}
</style>
