// Groups Management View — 2026 Commercial Edition (Étude Math Pro)
const GroupsView = {
  groups: [],
  selectedLevel: 'all',

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
              <span>${I18n.t('groups_title')}</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">${I18n.t('groups_subtitle')}</p>
          </div>

          <div class="flex items-center gap-2.5">
            <a href="#repartition" class="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5">
              <i data-lucide="sparkles" class="w-4 h-4 text-amber-600"></i>
              <span>${I18n.t('navRepartition')}</span>
            </a>

            <button onclick="GroupsView.openModal()" class="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-brand-600/30 transition-all flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>+ ${I18n.t('add_group')}</span>
            </button>
          </div>
        </div>

        <!-- Grade Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1" id="group-level-pills">
          <button onclick="GroupsView.filterByLevel('all')" class="group-level-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${this.selectedLevel === 'all' ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
            ${I18n.t('all_levels')}
          </button>
          <button onclick="GroupsView.filterByLevel('1ère')" class="group-level-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${this.selectedLevel === '1ère' ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
            ${I18n.getGradeLabel('1ère')}
          </button>
          <button onclick="GroupsView.filterByLevel('2ème')" class="group-level-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${this.selectedLevel === '2ème' ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
            ${I18n.getGradeLabel('2ème')}
          </button>
          <button onclick="GroupsView.filterByLevel('3ème')" class="group-level-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${this.selectedLevel === '3ème' ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
            ${I18n.getGradeLabel('3ème')}
          </button>
          <button onclick="GroupsView.filterByLevel('Bac')" class="group-level-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${this.selectedLevel === 'Bac' ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}">
            ${I18n.getGradeLabel('Bac')}
          </button>
        </div>

        <!-- Groups Grid Container -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="groups-grid">
          <div class="p-8 text-center text-slate-400 text-sm col-span-full">${I18n.t('loading')}</div>
        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();

    await this.loadGroups(container);
  },

  async filterByLevel(level) {
    this.selectedLevel = level;
    document.querySelectorAll('.group-level-btn').forEach(btn => {
      const isCurrent = (level === 'all' && btn.textContent.includes(I18n.t('all_levels'))) ||
                        btn.textContent.includes(I18n.getGradeLabel(level));
      btn.className = `group-level-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${isCurrent ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`;
    });

    const container = document.getElementById('main-view');
    if (container) await this.loadGroups(container);
  },

  async loadGroups(container) {
    const grid = container.querySelector('#groups-grid');
    if (!grid) return;
    const isAr = I18n.currentLang === 'ar';

    try {
      const groups = await API.get('/api/groups');
      this.groups = groups;
      State.groups = groups;

      let filtered = groups;
      if (this.selectedLevel !== 'all') {
        filtered = groups.filter(g => g.level && g.level.startsWith(this.selectedLevel));
      }

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="p-12 text-center bg-white rounded-3xl border border-slate-200 col-span-full">
            <i data-lucide="users" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
            <p class="text-base font-bold text-slate-700">${isAr ? 'لا يوجد أي فوج لهذا المستوى' : 'Aucun groupe trouvé pour ce niveau'}</p>
            <p class="text-xs text-slate-400 mt-1">${isAr ? 'يمكنك إنشاء فوج جديد أو تعديل التصفية' : 'Créez votre premier groupe ou modifiez le filtre ci-dessus.'}</p>
            <button onclick="GroupsView.openModal()" class="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm">
              + ${I18n.t('add_group')}
            </button>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      grid.innerHTML = filtered.map(g => {
        const levelLabel = I18n.getLevelLabel(g.level);
        const fillPct = Math.min(100, Math.round((g.student_count / g.capacity) * 100));
        const isFull = g.student_count >= g.capacity;
        const availableSeats = Math.max(0, g.capacity - g.student_count);

        return `
          <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-5 relative overflow-hidden group p-6"><div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
            
            <div class="space-y-3">
              <!-- Top bar: Color Dot + Group Title + Level Badge -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2.5">
                  <span class="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style="background-color: ${g.color || '#4f46e5'};"></span>
                  <h3 class="font-black text-slate-900 text-base group-hover:text-brand-600 transition-colors">${g.name}</h3>
                </div>
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 shrink-0">
                  ${levelLabel}
                </span>
              </div>

              <!-- Group Details -->
              <div class="space-y-1.5 text-xs text-slate-500">
                <p class="flex items-center gap-2">
                  <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-400"></i>
                  <span>${g.schedule || (isAr ? 'التوقيت غير محدد' : 'Horaire non défini')}</span>
                </p>
                <p class="flex items-center gap-2">
                  <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i>
                  <span>${g.location || 'Salle 1'}</span>
                </p>
              </div>

              <!-- Capacity Progress Bar -->
              <div class="pt-2 space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-700">
                    ${g.student_count} / ${g.capacity} ${I18n.t('students')}
                  </span>
                  <span class="font-bold ${isFull ? 'text-rose-600' : 'text-emerald-600'}">
                    ${isFull ? '🔴 ' + I18n.t('group_full') : `🟢 ${availableSeats} ${I18n.t('group_available_seats')}`}
                  </span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div class="h-2 rounded-full transition-all duration-300 ${isFull ? 'bg-rose-500' : fillPct > 75 ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${fillPct}%"></div>
                </div>
              </div>
            </div>

            <!-- Card Bottom Actions -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <a href="#students" onclick="StudentsView.filters.group_id = ${g.id};" class="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                <i data-lucide="users" class="w-3.5 h-3.5"></i>
                <span>${isAr ? 'عرض التلاميذ' : 'Voir les élèves'}</span>
              </a>

              <div class="flex items-center gap-1">
                <button onclick="GroupsView.openModal(${g.id})" class="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
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
      grid.innerHTML = `<div class="p-8 text-center text-rose-500 col-span-full">${isAr ? 'خطأ أثناء تحميل الأفواج.' : 'Erreur de chargement des groupes.'}</div>`;
    }
  },

  async openModal(groupId = null) {
    let group = null;
    if (groupId) {
      group = await API.get(`/api/groups/${groupId}`);
    }

    const isAr = I18n.currentLang === 'ar';
    const weekdaysFr = [
      { name: 'Lundi', short: 'Lu', index: 0 },
      { name: 'Mardi', short: 'Ma', index: 1 },
      { name: 'Mercredi', short: 'Me', index: 2 },
      { name: 'Jeudi', short: 'Je', index: 3 },
      { name: 'Vendredi', short: 'Ve', index: 4 },
      { name: 'Samedi', short: 'Sa', index: 5 },
      { name: 'Dimanche', short: 'Di', index: 6 }
    ];
    const weekdaysAr = [
      { name: 'الإثنين', short: 'إثن', index: 0 },
      { name: 'الثلاثاء', short: 'ثلا', index: 1 },
      { name: 'الأربعاء', short: 'أرب', index: 2 },
      { name: 'الخميس', short: 'خمي', index: 3 },
      { name: 'الجمعة', short: 'جمع', index: 4 },
      { name: 'السبت', short: 'سبت', index: 5 },
      { name: 'الأحد', short: 'أحد', index: 6 }
    ];
    const weekdays = isAr ? weekdaysAr : weekdaysFr;
    const initialDayOfWeek = (group && group.day_of_week !== null && group.day_of_week !== undefined) ? group.day_of_week : 6; // Default Dimanche

    Modal.open({
      title: group ? `${isAr ? 'تعديل الفوج' : 'Modifier le Groupe'} : ${group.name}` : `+ ${I18n.t('add_group')}`,
      size: 'max-w-lg',
      html: `
        <form id="group-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('group_name')} *</label>
            <input id="grp-name" type="text" required value="${group ? group.name : ''}" placeholder="Bac Math A" class="w-full px-3.5 py-2.5 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 bg-white font-semibold text-slate-900">
          </div>

          <!-- 2-Step Dependent Academic Level & Section Selector -->
          ${I18n.renderLevelSelectorsHTML({
            gradeId: 'grp-grade',
            sectionId: 'grp-section',
            sectionWrapperId: 'grp-section-wrapper',
            initialLevel: group ? group.level : 'Bac — Mathématiques'
          })}

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('max_capacity')} *</label>
              <input id="grp-capacity" type="number" min="1" max="50" required value="${group ? group.capacity : 15}" class="w-full px-3.5 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-bold">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('group_color')}</label>
              <input id="grp-color" type="color" value="${group && group.color ? group.color : '#c5a059'}" class="w-full h-10 p-1 border border-[#ded7ca] rounded-2xl cursor-pointer bg-white">
            </div>
          </div>

          <!-- Recurring Weekly Schedule (Horaire Fixe & Récurrent) -->
          <div class="p-3.5 bg-[#faf8f4] rounded-2xl border border-[#ebd9b5]/80 space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-800 uppercase mb-1.5 flex items-center justify-between">
                <span>${isAr ? 'يوم الحصة الأسبوعية القار *' : 'Jour du cours fixe (Récurrent) *'}</span>
                <span class="text-[10px] text-[#a27e38] font-bold">🔁 ${isAr ? 'أسبوعي' : 'Chaque semaine'}</span>
              </label>
              <div class="grid grid-cols-7 gap-1" id="grp-weekday-selector">
                ${weekdays.map(w => {
                  const isSelected = w.index === initialDayOfWeek;
                  return `
                    <button type="button" class="weekday-pill ${isSelected ? 'active' : ''}" data-day="${w.index}" data-name="${w.name}">
                      <span class="text-[10px] uppercase font-bold">${w.short}</span>
                    </button>
                  `;
                }).join('')}
              </div>
              <input id="grp-day-of-week" type="hidden" value="${initialDayOfWeek}">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">${isAr ? 'من الساعة' : 'De (Heure début)'}</label>
                <input id="grp-start-time" type="time" required value="${group && group.start_time ? group.start_time : '10:00'}" class="w-full px-3 py-1.5 text-xs font-bold border border-[#ded7ca] rounded-xl bg-white">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">${isAr ? 'إلى الساعة' : 'À (Heure fin)'}</label>
                <input id="grp-end-time" type="time" required value="${group && group.end_time ? group.end_time : '12:00'}" class="w-full px-3 py-1.5 text-xs font-bold border border-[#ded7ca] rounded-xl bg-white">
              </div>
            </div>

            <div class="p-2 bg-white rounded-xl border border-[#ede5d8] text-[11px] flex items-center justify-between">
              <span class="text-slate-500 font-medium">${isAr ? 'ملخص التوقيت :' : 'Horaire récurrent :'}</span>
              <strong class="text-slate-900 font-bold" id="grp-schedule-preview">---</strong>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${isAr ? 'القاعة' : 'Salle / Lieu'}</label>
            <input id="grp-location" type="text" value="${group && group.location ? group.location : 'Salle 1'}" class="w-full px-3.5 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-medium">
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-[#ede7db]">
            <button type="button" onclick="Modal.close()" class="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-[#ede5d8] rounded-2xl transition-colors">
              ${I18n.t('cancel')}
            </button>
            <button type="submit" class="px-5 py-2.5 btn-gold-action text-xs sm:text-sm font-black">
              ${group ? I18n.t('save') : I18n.t('add_group')}
            </button>
          </div>
        </form>
      `,
      onOpen: (content) => {
        const levelBinding = I18n.bindLevelSelectors({
          container: content,
          gradeId: 'grp-grade',
          sectionId: 'grp-section',
          sectionWrapperId: 'grp-section-wrapper',
          initialLevel: group ? group.level : 'Bac — Mathématiques'
        });

        const dayInput = content.querySelector('#grp-day-of-week');
        const startTimeInput = content.querySelector('#grp-start-time');
        const endTimeInput = content.querySelector('#grp-end-time');
        const previewEl = content.querySelector('#grp-schedule-preview');
        const weekdayButtons = content.querySelectorAll('#grp-weekday-selector .weekday-pill');

        function updateSchedulePreview() {
          const dIdx = parseInt(dayInput.value);
          const dayObj = weekdays.find(w => w.index === dIdx) || weekdays[6];
          const st = startTimeInput.value || '10:00';
          const et = endTimeInput.value || '12:00';
          previewEl.innerText = `${dayObj.name} ${st} → ${et}`;
        }

        weekdayButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            weekdayButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            dayInput.value = btn.getAttribute('data-day');
            updateSchedulePreview();
          });
        });

        startTimeInput.addEventListener('input', updateSchedulePreview);
        endTimeInput.addEventListener('input', updateSchedulePreview);
        updateSchedulePreview();

        const form = content.querySelector('#group-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const selectedFullLevel = levelBinding ? levelBinding.getSelectedLevel() : 'Bac — Mathématiques';
          const dIdx = parseInt(dayInput.value);
          const dayObj = weekdays.find(w => w.index === dIdx) || weekdays[6];
          const st = startTimeInput.value;
          const et = endTimeInput.value;
          const scheduleSummary = `${dayObj.name} ${st} - ${et}`;

          const payload = {
            name: content.querySelector('#grp-name').value.trim(),
            level: selectedFullLevel,
            capacity: parseInt(content.querySelector('#grp-capacity').value) || 15,
            day_of_week: dIdx,
            start_time: st,
            end_time: et,
            schedule: scheduleSummary,
            location: content.querySelector('#grp-location').value.trim() || 'Salle 1',
            color: content.querySelector('#grp-color').value || '#c5a059'
          };

          try {
            if (group) {
              await API.put(`/api/groups/${group.id}`, payload);
              Toast.success(isAr ? 'تم تعديل الفوج بنجاح !' : 'Groupe et horaire récurrent modifiés avec succès !');
            } else {
              await API.post('/api/groups', payload);
              Toast.success(isAr ? 'تم إنشاء الفوج مع جدولته التلقائية !' : 'Groupe créé avec horaire hebdomadaire récurrent !');
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

  deleteGroup(groupId, groupName) {
    const isAr = I18n.currentLang === 'ar';
    Modal.confirm({
      title: isAr ? 'حذف الفوج' : 'Supprimer le groupe',
      message: isAr ? `هل أنت متأكد من رغبتك في حذف الفوج "${groupName}" ؟ سيبقى التلاميذ المسجلون دون فوج.` : `Êtes-vous sûr de vouloir supprimer le groupe "${groupName}" ? Les élèves associés seront basculés en "Sans groupe".`,
      confirmText: I18n.t('delete'),
      onConfirm: async () => {
        try {
          await API.delete(`/api/groups/${groupId}`);
          Toast.success(isAr ? 'تم حذف الفوج بنجاح.' : 'Groupe supprimé.');
          await State.loadInitialData();
          app.navigate('#groups');
        } catch (e) {
          Toast.error(e.message);
        }
      }
    });
  }
};

