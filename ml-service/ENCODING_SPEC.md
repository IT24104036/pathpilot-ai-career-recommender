# PathPilot — Feature-Encoding Specification (v1)

**Status:** Frozen contract. This file is the single source of truth for how a
PathPilot assessment is converted into an ML feature vector.

The **same** encoding must be used by:

1. Frontend assessment answers (raw strings sent as-is)
2. Backend `/api/assess` route
3. Synthetic dataset generator
4. Model training
5. Live prediction after deployment

> ⚠️ Do not change answer strings or column names/order without bumping the
> version and re-generating the dataset + retraining. Train/serve must match.

---

## Global encoding rules

- Frontend answer strings must match **exactly** (case, spaces, punctuation, `&`, `/`).
- **Ordinal** fields are stored as integers `0–4` in the CSV. Any scaling
  (MinMax / Standard) happens inside the model pipeline only — not in the CSV.
- **Multi-hot**: each selectable option maps to one binary column (`1`/`0`).
  Nothing selected ⇒ all zeros for that group.
- **One-hot**: exactly one column is `1`; the rest `0`.
- Unknown value ⇒ all-zeros for its group. Missing ordinal ⇒ `0`.
- The master column order in §13 is fixed and shared by generator + training + serving.

---

## 1. `field_of_study`  *(one-hot, nominal — to be re-added to the form)*

| Frontend value | Column set to 1 |
|---|---|
| Computer Science | `fos_cs` |
| Software Engineering | `fos_se` |
| Information Systems / IT | `fos_is` |
| Data Science | `fos_ds` |
| Cybersecurity | `fos_cyber` |
| Other IT field | `fos_other` |

→ 6 columns

## 2. `status` → `academic_status`  *(ordinal 0–4)*

| Frontend value | Encoded |
|---|---|
| 1st / 2nd year undergraduate | 0 |
| 3rd year undergraduate | 1 |
| Final year undergraduate | 2 |
| Recent graduate | 3 |
| Postgraduate / Masters | 4 |

→ 1 column

## 3. `modules`  *(multi-hot, 9)*

| Frontend value | Column |
|---|---|
| Algorithms & Data Structures | `mod_algorithms` |
| Databases & SQL | `mod_databases` |
| Statistics & Math | `mod_statistics` |
| Web & App Development | `mod_webdev` |
| Networking & Security | `mod_networking` |
| UI/UX & Design | `mod_uiux` |
| Machine Learning & AI | `mod_mlai` |
| Cloud Computing | `mod_cloud` |
| Project & Business Management | `mod_projbusiness` |

→ 9 columns

## 4. `coding` → `coding_comfort`  *(ordinal 0–4)*

| Frontend value | Encoded |
|---|---|
| I love coding | 4 |
| Comfortable with code | 3 |
| Neutral about coding | 2 |
| I prefer minimal coding | 1 |
| I'd rather avoid coding | 0 |

→ 1 column

## 5. `skills`  *(multi-hot, 8)*

| Frontend value | Column |
|---|---|
| Programming | `skill_programming` |
| Data Analysis | `skill_data_analysis` |
| Machine Learning | `skill_ml` |
| Cloud & DevOps | `skill_cloud_devops` |
| Cybersecurity | `skill_security` |
| Design & Prototyping | `skill_design` |
| Communication & Leadership | `skill_comm_leadership` |
| Business Analysis | `skill_business` |

→ 8 columns

## 6. `activities`  *(multi-hot, 8)*

| Frontend value | Column |
|---|---|
| Analyzing data & finding patterns | `act_data_patterns` |
| Building apps & software | `act_build_apps` |
| Training ML / AI models | `act_train_ml` |
| Designing user interfaces | `act_design_ui` |
| Securing systems & networks | `act_secure_systems` |
| Working with cloud & infrastructure | `act_cloud_infra` |
| Planning & coordinating projects | `act_plan_projects` |
| Solving business problems | `act_business_problems` |

→ 8 columns

## 7. `problemStyle` → `problem_style`  *(one-hot, 6)*

| Frontend value | Column set to 1 |
|---|---|
| Data & logic puzzles | `ps_data_logic` |
| Building & coding challenges | `ps_build_code` |
| Visual & design problems | `ps_visual_design` |
| Security & investigation | `ps_security` |
| People & coordination | `ps_people_coord` |
| Business & strategy | `ps_business` |

→ 6 columns

## 8. `workStyle` → `work_environment`  *(one-hot, 5)*

| Frontend value | Column set to 1 |
|---|---|
| Independent / remote | `we_independent` |
| Collaborative team | `we_collaborative` |
| Fast-paced startup | `we_startup` |
| Structured corporate | `we_corporate` |
| Research-focused | `we_research` |

→ 5 columns

## 9. `personality`  *(multi-hot, 8)*

| Frontend value | Column |
|---|---|
| Analytical | `trait_analytical` |
| Creative | `trait_creative` |
| Detail-oriented | `trait_detail` |
| Curious | `trait_curious` |
| Leader | `trait_leader` |
| Problem-solver | `trait_problem_solver` |
| Communicator | `trait_communicator` |
| Persistent | `trait_persistent` |

→ 8 columns

## 10. `workPreference` → `work_flexibility`  *(ordinal 0–4)*

| Frontend value | Encoded |
|---|---|
| Highly structured & predictable | 0 |
| Mostly structured | 1 |
| A balance of both | 2 |
| Mostly flexible | 3 |
| Highly flexible & creative | 4 |

→ 1 column

---

## 11. Excluded fields (NOT model features)

| Field | Reason |
|---|---|
| **`careerPreference`** | **Label leakage** — the user explicitly names target careers; it is a proxy for the answer. Still collected/stored in `answers`; may be one-hot `pref_*` **outside** the model for re-ranking only. |
| `prediction`, `matchScores` | Current mock recommendation output — encodes the (fake) label. |
| `userId`, `timestamp`, `degree` (null) | Metadata; no predictive value. |
| legacy `programming`, `mathematics`, `communication`, `leadership`, `creativity`, `problemSolving`, `business` (numbers in Mongo schema) | Never populated; not part of this spec. |

---

## 12. Target label

- CSV column: **`career_path`** (string).
- Canonical class order (fixed — defines `LabelEncoder` integers 0–8):

| Int | Career class |
|---|---|
| 0 | Data Analyst |
| 1 | Data Scientist |
| 2 | Machine Learning Engineer |
| 3 | Software Engineer |
| 4 | Business Analyst |
| 5 | UI/UX Designer |
| 6 | Cybersecurity Analyst |
| 7 | Cloud / DevOps Engineer |
| 8 | Project Manager |

---

## 13. Master feature vector — fixed order (53 features + label)

```
# ordinals (3)
academic_status, coding_comfort, work_flexibility,

# field_of_study one-hot (6)
fos_cs, fos_se, fos_is, fos_ds, fos_cyber, fos_other,

# modules multi-hot (9)
mod_algorithms, mod_databases, mod_statistics, mod_webdev, mod_networking,
mod_uiux, mod_mlai, mod_cloud, mod_projbusiness,

# skills multi-hot (8)
skill_programming, skill_data_analysis, skill_ml, skill_cloud_devops,
skill_security, skill_design, skill_comm_leadership, skill_business,

# activities multi-hot (8)
act_data_patterns, act_build_apps, act_train_ml, act_design_ui,
act_secure_systems, act_cloud_infra, act_plan_projects, act_business_problems,

# problem_style one-hot (6)
ps_data_logic, ps_build_code, ps_visual_design, ps_security, ps_people_coord, ps_business,

# work_environment one-hot (5)
we_independent, we_collaborative, we_startup, we_corporate, we_research,

# personality multi-hot (8)
trait_analytical, trait_creative, trait_detail, trait_curious,
trait_leader, trait_problem_solver, trait_communicator, trait_persistent,

# label
career_path
```

---

## 14. Totals

| Group | Count |
|---|---|
| Ordinal features | 3 |
| One-hot features (fos 6 + ps 6 + we 5) | 17 |
| Multi-hot features (mod 9 + skill 8 + act 8 + trait 8) | 33 |
| **Total input features** | **53** |
| Target label (`career_path`, 9 classes) | 1 |
| **CSV columns total** | **54** |

---

## 15. Implementation notes (for later, not now)

- Build a single `encode_answers(answers) -> [53]` function (Python) shared by the
  generator and the serving layer — one source of truth. The frontend keeps
  sending raw answer strings; encoding stays server / ML-side.
- Keep this file and the dataset/model in sync. Any answer-string or column change
  ⇒ bump to v2, regenerate `dataset/career_dataset.csv`, retrain.

_Spec version: v1 — finalized during Step 2 of the AI/ML plan (dataset design)._
