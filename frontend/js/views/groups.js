// Groups Management View — 2026 Commercial Edition (Étude Math Pro)
const GroupsView = {
  groups: [],

  async render(container) {
    const isAr = I18n.currentLang === 'ar';

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <i data-lucide="users" class="w-5 h-5"></i>
              </div>
              ${I18n.t('groups')}
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">${I18n.t('manageGroupsDesc')}</p>
          </div>

          <div class="flex items-center gap-2.5">
            <a href="#repartition" class="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">
              <i data-lucide="sparkles" class="w-4 h-4 text-amber-600"></i>
              <span>${I18n.t('smartRepartitionTitle')}</span>
            </a>
            <button onclick="GroupsView.openModal()" class="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-brand-600/30 transition-all flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>+ ${I18n.t('newGroup')}</span>
            </button>
          </div>
        </div>

        <!-- Groups Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="groups-grid">
          <div class="p-12 text-center text-slate-400 text-sm col-span-full">${I18n.t('loading')}</div>
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
            <p class="text-base font-bold text-slate-700">${I18n.t('noGroupsCreated')}</p>
            <p class="text-xs text-slate-400 mt-1">${I18n.t('createGroupFirstDesc')}</p>
            <button onclick="GroupsView.openModal()" class="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm">
              + ${I18n.t('newGroup')}
            </button>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      grid.innerHTML = groups.map(g => {
        const percent = Math.min(100, Math.round((g.student_count / g.capacity) * 100));
        const isFull = g.student_count >= g.capacity;
        const levelLabel = I18n.getLevelLabel(g.level);
        
        return `
          <div class="bg-white rounded-3xl p-6 border ${isFull ? 'border-amber-300 ring-2 ring-amber-100 shadow-md' : 'border-slate-200/80 shadow-sm'} hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden">
            
            <!-- Top color accent stripe -->
            <div class="absolute top-0 inset-x-0 h-1.5" style="background-color: ${g.color || '#4f46e5'}"></div>

            <div class="space-y-4">
              
              <!-- Title & Badges -->
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-black text-slate-900 tracking-tight">${g.name}</h3>
                  <p class="text-xs text-slate-500 font-medium mt-0.5">${I18n.t('mathLesson')} • ${levelLabel}</p>
                </div>
                <div class="flex items-center gap-1.5">
                  ${isFull ? `
                    <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      ${I18n.t('full')}
                    </span>
                  ` : `
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ${g.capacity - g.student_count} ${I18n.t('availablePlaces')}
                    </span>
                  `}
                </div>
              </div>

              <!-- Capacity Progress Bar -->
              <div class="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>${I18n.t('capacity')}</span>
                  <span class="${isFull ? 'text-rose-600' : 'text-slate-900'}">${g.student_count} / ${g.capacity} (${percent}%)</span>
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
                  <span>${g.schedule || I18n.t('noSchedule')}</span>
                </div>
                <div class="flex items-center gap-2">
                  <i data-lucide="map-pin" class="w-4 h-4 text-slate-400"></i>
                  <span>${g.location || 'Salle 1'}</span>
                </div>
              </div>

            </div>

            <!-- Card Actions -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button onclick="GroupsView.openRosterModal(${g.id})" class="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5">
                <i data-lucide="users" class="w-4 h-4"></i> ${I18n.t('viewStudents')} (${g.student_count})
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
      title: group ? `${I18n.t('edit')} : ${group.name}` : `+ ${I18n.t('newGroup')}`,
      size: 'max-w-lg',
      html: `
        <form id="group-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('groupName')} *</label>
            <input id="grp-name" type="text" required value="${group ? group.name : ''}" placeholder="Bac Math A" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
          </div>

          <!-- Strict 4 School Levels -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('level')} *</label>
              <select id="grp-level" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white">
                <option value="1ère" ${group && (group.level === '1ère' || group.level === '1ère Année') ? 'selected' : ''}>${I18n.getLevelLabel('1ère')}</option>
                <option value="2ème" ${group && (group.level === '2ème' || group.level === '2ème Sciences') ? 'selected' : ''}>${I18n.getLevelLabel('2ème')}</option>
                <option value="3ème" ${group && group.level === '3ème' ? 'selected' : ''}>${I18n.getLevelLabel('3ème')}</option>
                <option value="Bac" ${group && (group.level === 'Bac' || group.level === 'Baccalauréat') ? 'selected' : (!group ? 'selected' : '')}>${I18n.getLevelLabel('Bac')}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('maxCapacity')} *</label>
              <input id="grp-capacity" type="number" min="1" max="50" required value="${group ? group.capacity : 15}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('habitualSchedule')}</label>
            <input id="grp-schedule" type="text" value="${group && group.schedule ? group.schedule : ''}" placeholder="Samedi 10:00 - 12:00" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('room')}</label>
              <input id="grp-location" type="text" value="${group && group.location ? group.location : 'Salle 1'}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('color')}</label>
              <input id="grp-color" type="color" value="${group && group.color ? group.color : '#4f46e5'}" class="w-full h-9 p-1 border border-slate-200 rounded-xl cursor-pointer">
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onclick="Modal.close()" class="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
              ${I18n.t('cancel')}
            </button>
            <button type="submit" class="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm">
              ${group ? I18n.t('saveChanges') : I18n.t('newGroup')}
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

      const levelLabel = I18n.getLevelLabel(group.level);

      Modal.open({
        title: `${group.name} (${students.length}/${group.capacity})`,
        size: 'max-w-xl',
        html: `
          <div class="space-y-4">
            <div class="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span>${I18n.t('level')} : <strong>${levelLabel}</strong></span>
              <span>${I18n.t('schedule')} : <strong>${group.schedule || I18n.t('noSchedule')}</strong></span>
            </div>

            ${students.length === 0 ? `
              <div class="text-center py-8 text-slate-400 text-xs">
                ${I18n.t('noStudentsInGroup')}
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
                        <p class="text-[11px] text-slate-400 font-mono">${s.student_code} • 📞 ${s.student_phone || I18n.t('noPhone')}</p>
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
                ${I18n.t('close')}
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
      title: I18n.t('delete'),
      message: `Êtes-vous sûr de vouloir supprimer le groupe "${groupName}" ? Les élèves ne seront pas supprimés mais deviendront "sans groupe".`,
      confirmText: I18n.t('delete'),
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

