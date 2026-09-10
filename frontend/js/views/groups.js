// Groups Management View
const GroupsView = {
  groups: [],

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <i data-lucide="users" class="w-5 h-5"></i>
              </div>
              Gestion des Groupes
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Organisez vos classes, contrôlez les jauges de capacité et les effectifs.</p>
          </div>

          <div class="flex items-center gap-2.5">
            <a href="#repartition" class="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">
              <i data-lucide="sparkles" class="w-4 h-4 text-amber-600"></i>
              <span>Répartition Auto</span>
            </a>
            <button onclick="GroupsView.openModal()" class="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-brand-600/30 transition-all flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>+ Créer un Groupe</span>
            </button>
          </div>
        </div>

        <!-- Groups Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="groups-grid">
          <div class="p-12 text-center text-slate-400 text-sm col-span-full">Chargement des groupes...</div>
        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();
    await this.loadGroups(container);
  },

  async loadGroups(container) {
    const grid = container.querySelector('#groups-grid');
    if (!grid) return;

    try {
      const groups = await API.get('/api/groups');
      this.groups = groups;
      State.groups = groups;

      if (groups.length === 0) {
        grid.innerHTML = `
          <div class="p-12 text-center bg-white rounded-3xl border border-slate-200 col-span-full">
            <i data-lucide="users" class="w-10 h-10 text-slate-300 mx-auto mb-3"></i>
            <p class="text-base font-bold text-slate-700">Aucun groupe créé</p>
            <p class="text-xs text-slate-400 mt-1">Créez votre première classe pour y affecter des élèves.</p>
            <button onclick="GroupsView.openModal()" class="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm">
              + Créer un groupe
            </button>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      grid.innerHTML = groups.map(g => {
        const percent = Math.min(100, Math.round((g.student_count / g.capacity) * 100));
        const isFull = g.student_count >= g.capacity;
        
        return `
          <div class="bg-white rounded-3xl p-6 border ${isFull ? 'border-amber-300 ring-2 ring-amber-100 shadow-md' : 'border-slate-200/80 shadow-sm'} hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden">
            
            <!-- Top color accent stripe -->
            <div class="absolute top-0 inset-x-0 h-1.5" style="background-color: ${g.color || '#4f46e5'}"></div>

            <div class="space-y-4">
              
              <!-- Title & Badges -->
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-black text-slate-900 tracking-tight">${g.name}</h3>
                  <p class="text-xs text-slate-500 font-medium mt-0.5">${g.subject} • ${g.level}</p>
                </div>
                <div class="flex items-center gap-1.5">
                  ${isFull ? `
                    <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      Complet
                    </span>
                  ` : `
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ${g.capacity - g.student_count} place(s) dispo
                    </span>
                  `}
                </div>
              </div>

              <!-- Capacity Progress Bar -->
              <div class="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Effectif</span>
                  <span class="${isFull ? 'text-rose-600' : 'text-slate-900'}">${g.student_count} / ${g.capacity} élèves (${percent}%)</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div class="h-2.5 rounded-full transition-all duration-500 ${
                    percent >= 100 ? 'bg-rose-500' : percent >= 75 ? 'bg-amber-500' : 'bg-brand-600'
                  }" style="width: ${percent}%"></div>
                </div>
              </div>

              <!-- Schedule & Room Info -->
              <div class="space-y-2 text-xs text-slate-600 pt-1">
                <div class="flex items-center gap-2">
                  <i data-lucide="clock" class="w-4 h-4 text-slate-400"></i>
                  <span>${g.schedule || 'Horaire non configuré'}</span>
                </div>
                <div class="flex items-center gap-2">
                  <i data-lucide="map-pin" class="w-4 h-4 text-slate-400"></i>
                  <span>${g.location || 'Salle Principale'}</span>
                </div>
              </div>

            </div>

            <!-- Card Actions -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button onclick="GroupsView.openRosterModal(${g.id})" class="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5">
                <i data-lucide="users" class="w-4 h-4"></i> Voir les élèves (${g.student_count})
              </button>

              <div class="flex items-center gap-1">
                <button onclick="GroupsView.openModal(${g.id})" class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <i data-lucide="edit" class="w-4 h-4"></i>
                </button>
                <button onclick="GroupsView.deleteGroup(${g.id}, '${g.name}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>

          </div>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons();
    } catch (err) {
      grid.innerHTML = `<div class="p-8 text-center text-rose-500 col-span-full">Erreur de chargement des groupes.</div>`;
    }
  },

  async openModal(groupId = null) {
    let group = null;
    if (groupId) {
      group = await API.get(`/api/groups/${groupId}`);
    }

    Modal.open({
      title: group ? `Modifier le groupe : ${group.name}` : '+ Créer un nouveau groupe',
      size: 'max-w-lg',
      html: `
        <form id="group-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Nom du groupe *</label>
            <input id="grp-name" type="text" required value="${group ? group.name : ''}" placeholder="ex: Bac Math A" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Niveau *</label>
              <select id="grp-level" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white">
                <option value="Baccalauréat" ${group && group.level === 'Baccalauréat' ? 'selected' : ''}>Baccalauréat</option>
                <option value="3ème" ${group && group.level === '3ème' ? 'selected' : ''}>3ème Année</option>
                <option value="2ème Sciences" ${group && group.level === '2ème Sciences' ? 'selected' : ''}>2ème Sciences</option>
                <option value="9ème Année" ${group && group.level === '9ème Année' ? 'selected' : ''}>9ème Année</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Capacité Maximale *</label>
              <input id="grp-capacity" type="number" min="1" max="50" required value="${group ? group.capacity : 15}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Horaire Habituel</label>
            <input id="grp-schedule" type="text" value="${group && group.schedule ? group.schedule : ''}" placeholder="ex: Samedi 10:00 - 12:00" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Salle / Lieu</label>
              <input id="grp-location" type="text" value="${group && group.location ? group.location : 'Salle 1'}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Couleur</label>
              <input id="grp-color" type="color" value="${group && group.color ? group.color : '#4f46e5'}" class="w-full h-9 p-1 border border-slate-200 rounded-xl cursor-pointer">
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onclick="Modal.close()" class="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
              Annuler
            </button>
            <button type="submit" class="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm">
              ${group ? 'Mettre à jour' : 'Créer le groupe'}
            </button>
          </div>
        </form>
      `,
      onOpen: (content) => {
        const form = content.querySelector('#group-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const payload = {
            name: content.querySelector('#grp-name').value.trim(),
            level: content.querySelector('#grp-level').value,
            subject: 'Mathématiques',
            capacity: parseInt(content.querySelector('#grp-capacity').value) || 15,
            schedule: content.querySelector('#grp-schedule').value.trim() || null,
            location: content.querySelector('#grp-location').value.trim() || 'Salle 1',
            color: content.querySelector('#grp-color').value
          };

          try {
            if (group) {
              await API.put(`/api/groups/${group.id}`, payload);
              Toast.success('Groupe mis à jour avec succès !');
            } else {
              await API.post('/api/groups', payload);
              Toast.success('Nouveau groupe créé avec succès !');
            }
            Modal.close();
            await State.loadInitialData();
            app.navigate('#groups');
          } catch (err) {
            Toast.error(err.message);
          }
        });
      }
    });
  },

  async openRosterModal(groupId) {
    try {
      const [group, students] = await Promise.all([
        API.get(`/api/groups/${groupId}`),
        API.get(`/api/groups/${groupId}/students`)
      ]);

      Modal.open({
        title: `Élèves inscrits : ${group.name} (${students.length}/${group.capacity})`,
        size: 'max-w-xl',
        html: `
          <div class="space-y-4">
            <div class="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span>Niveau : <strong>${group.level}</strong></span>
              <span>Horaire : <strong>${group.schedule || 'Non défini'}</strong></span>
            </div>

            ${students.length === 0 ? `
              <div class="text-center py-8 text-slate-400 text-xs">
                Aucun élève affecté à ce groupe pour le moment.
              </div>
            ` : `
              <div class="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                ${students.map(s => `
                  <div class="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-slate-100 font-bold flex items-center justify-center text-xs text-slate-700">
                        ${s.first_name.charAt(0)}${s.last_name.charAt(0)}
                      </div>
                      <div>
                        <p class="font-bold text-slate-900">${s.first_name} ${s.last_name}</p>
                        <p class="text-[11px] text-slate-400">${s.student_code} • 📞 ${s.student_phone || 'Sans tel'}</p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      <a href="#students/${s.id}" onclick="Modal.close()" class="p-1 text-slate-400 hover:text-brand-600 rounded">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                      </a>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}

            <div class="pt-4 border-t border-slate-100 flex justify-end">
              <button onclick="Modal.close()" class="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                Fermer
              </button>
            </div>
          </div>
        `
      });
      if (window.lucide) lucide.createIcons();
    } catch (e) {
      Toast.error('Erreur lors de la récupération des élèves.');
    }
  },

  deleteGroup(groupId, groupName) {
    Modal.confirm({
      title: "Supprimer le groupe",
      message: `Êtes-vous sûr de vouloir supprimer le groupe "${groupName}" ? Les élèves ne seront pas supprimés mais deviendront "sans groupe".`,
      confirmText: 'Supprimer',
      onConfirm: async () => {
        try {
          await API.delete(`/api/groups/${groupId}`);
          Toast.success('Groupe supprimé.');
          await State.loadInitialData();
          app.navigate('#groups');
        } catch (e) {
          Toast.error(e.message);
        }
      }
    });
  }
};
