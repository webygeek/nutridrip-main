"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { DashLayout } from "@/components/dashboard/DashLayout";
import {
  DEMO_PATIENTS, DEMO_CLINICS, DEMO_DOCTORS_DASH,
  type DashPatient, type DashClinic, type DashDoctor,
  formatDate,
} from "@/lib/data/dashboard-mock";
import { DEMO_NURSES, type DashNurse } from "@/lib/data/nursing-mock";

type Tab = "patients" | "doctors" | "clinics" | "nurses";

const MANAGE_CSS = `
  .manage-tabs {
    display:flex;gap:0;background:var(--white);border-radius:var(--radius);
    border:1.5px solid var(--border);padding:4px;margin-bottom:24px;overflow-x:auto;
  }
  .mt-btn {
    padding:10px 18px;border-radius:var(--radius-sm);border:none;
    font-size:13px;font-weight:500;font-family:var(--font-display);
    color:var(--text-3);cursor:pointer;background:transparent;
    transition:all .15s;white-space:nowrap;
  }
  .mt-btn.active { background:var(--teal);color:#fff; }
  .mt-btn:not(.active):hover { color:var(--teal); }

  .manage-actions { display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:12px;flex-wrap:wrap; }
  .add-btn {
    padding:10px 22px;border-radius:50px;border:none;
    background:linear-gradient(145deg,var(--teal),var(--sky));color:#fff;
    font-size:13px;font-weight:600;font-family:var(--font-display);
    cursor:pointer;box-shadow:0 3px 12px rgba(26,126,168,0.25);
    transition:transform .2s;
  }
  .add-btn:hover { transform:translateY(-1px); }

  .search-input {
    padding:9px 14px;border-radius:var(--radius-sm);
    border:1.5px solid var(--border);background:var(--white);
    font-size:13px;font-family:var(--font-display);min-width:260px;outline:none;
  }
  .search-input:focus { border-color:var(--sky); }

  .mm-overlay {
    position:fixed;inset:0;z-index:200;
    display:flex;align-items:center;justify-content:center;padding:20px;
    background:rgba(14,34,51,0.55);backdrop-filter:blur(6px);
  }
  .mm-card {
    width:100%;max-width:580px;max-height:90vh;overflow:auto;
    background:var(--white);border-radius:var(--radius);padding:32px;
    box-shadow:0 20px 60px rgba(14,34,51,0.18);
  }
  .mm-title { font-size:20px;font-weight:600;letter-spacing:-0.5px;margin-bottom:6px; }
  .mm-title em { font-style:italic;font-family:var(--font-serif);color:var(--teal);font-weight:400; }
  .mm-sub { font-size:13px;color:var(--text-3);margin-bottom:20px;line-height:1.6; }

  .mm-field { display:flex;flex-direction:column;gap:6px;margin-bottom:14px; }
  .mm-label { font-size:11px;font-weight:500;color:var(--text-2);letter-spacing:0.5px; }
  .mm-input {
    padding:10px 14px;border-radius:var(--radius-sm);
    border:1.5px solid var(--border);background:var(--off-white);
    font-size:13px;font-family:var(--font-display);outline:none;
    transition:border-color .2s;
  }
  .mm-input:focus { border-color:var(--sky); }
  .mm-row { display:grid;grid-template-columns:1fr 1fr;gap:12px; }

  .mm-actions { display:flex;gap:10px;justify-content:flex-end;margin-top:20px; }
  .mm-btn {
    padding:10px 22px;border-radius:50px;border:none;
    font-size:13px;font-weight:600;font-family:var(--font-display);
    cursor:pointer;transition:all .15s;
  }
  .mm-btn.cancel { background:var(--off-white);color:var(--text-2);border:1.5px solid var(--border); }
  .mm-btn.save { background:linear-gradient(145deg,var(--teal),var(--sky));color:#fff; }

  .expand-row { background:var(--sky-pale);padding:16px 20px;font-size:12px;color:var(--text-2);line-height:1.7; }
  .expand-row strong { color:var(--teal); }
`;

type PatientFormState = Omit<DashPatient, "id" | "joinedAt" | "vitalityScore" | "totalSessions" | "lastVisit">;
type DoctorFormState = Omit<DashDoctor, "id" | "approvalsThisMonth" | "avgTurnaroundHrs">;
type ClinicFormState = Omit<DashClinic, "id" | "partnersSince" | "monthlyVolume">;
type NurseFormState = Omit<DashNurse, "id" | "activeOrders" | "totalCompleted" | "joinedAt">;

const EMPTY_PATIENT: PatientFormState = { name: "", age: 0, gender: "M", email: "", phone: "", primaryConcern: "" };
const EMPTY_DOCTOR: DoctorFormState = { name: "", specialty: "", rating: 5, status: "available" };
const EMPTY_CLINIC: ClinicFormState = { name: "", location: "", contact: "", status: "pending" };
const EMPTY_NURSE: NurseFormState = { name: "", rnNumber: "", shift: "morning", status: "available", rating: 5, phone: "", certifications: [] };

export default function AdminManagePage() {
  const [tab, setTab] = useState<Tab>("patients");
  const [search, setSearch] = useState("");

  const [patients, setPatients] = useState(DEMO_PATIENTS);
  const [doctors, setDoctors] = useState(DEMO_DOCTORS_DASH);
  const [clinics, setClinics] = useState(DEMO_CLINICS);
  const [nurses, setNurses] = useState(DEMO_NURSES);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [patientForm, setPatientForm] = useState<PatientFormState>(EMPTY_PATIENT);
  const [doctorForm, setDoctorForm] = useState<DoctorFormState>(EMPTY_DOCTOR);
  const [clinicForm, setClinicForm] = useState<ClinicFormState>(EMPTY_CLINIC);
  const [nurseForm, setNurseForm] = useState<NurseFormState>(EMPTY_NURSE);

  const lowerSearch = search.toLowerCase();

  const filteredPatients = patients.filter((p) => p.name.toLowerCase().includes(lowerSearch) || p.email.toLowerCase().includes(lowerSearch));
  const filteredDoctors = doctors.filter((d) => d.name.toLowerCase().includes(lowerSearch) || d.specialty.toLowerCase().includes(lowerSearch));
  const filteredClinics = clinics.filter((c) => c.name.toLowerCase().includes(lowerSearch) || c.location.toLowerCase().includes(lowerSearch));
  const filteredNurses = nurses.filter((n) => n.name.toLowerCase().includes(lowerSearch) || n.rnNumber.toLowerCase().includes(lowerSearch));

  function openAdd() {
    setEditingId(null);
    if (tab === "patients") setPatientForm(EMPTY_PATIENT);
    if (tab === "doctors") setDoctorForm(EMPTY_DOCTOR);
    if (tab === "clinics") setClinicForm(EMPTY_CLINIC);
    if (tab === "nurses") setNurseForm(EMPTY_NURSE);
    setModalOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    if (tab === "patients") {
      const p = patients.find((x) => x.id === id);
      if (p) setPatientForm({ name: p.name, age: p.age, gender: p.gender, email: p.email, phone: p.phone, primaryConcern: p.primaryConcern });
    }
    if (tab === "doctors") {
      const d = doctors.find((x) => x.id === id);
      if (d) setDoctorForm({ name: d.name, specialty: d.specialty, rating: d.rating, status: d.status });
    }
    if (tab === "clinics") {
      const c = clinics.find((x) => x.id === id);
      if (c) setClinicForm({ name: c.name, location: c.location, contact: c.contact, status: c.status });
    }
    if (tab === "nurses") {
      const n = nurses.find((x) => x.id === id);
      if (n) setNurseForm({ name: n.name, rnNumber: n.rnNumber, shift: n.shift, status: n.status, rating: n.rating, phone: n.phone, certifications: n.certifications });
    }
    setModalOpen(true);
  }

  function handleSave() {
    if (tab === "patients") {
      if (editingId) {
        setPatients((prev) => prev.map((p) => p.id === editingId ? { ...p, ...patientForm } : p));
      } else {
        const newId = `p-${String(patients.length + 100).padStart(3, "0")}`;
        setPatients((prev) => [...prev, {
          id: newId, ...patientForm,
          joinedAt: new Date().toISOString(),
          vitalityScore: 60, totalSessions: 0, lastVisit: null,
        }]);
      }
    }
    if (tab === "doctors") {
      if (editingId) {
        setDoctors((prev) => prev.map((d) => d.id === editingId ? { ...d, ...doctorForm } : d));
      } else {
        const newId = `dr-${String(doctors.length + 100).padStart(3, "0")}`;
        setDoctors((prev) => [...prev, {
          id: newId, ...doctorForm,
          approvalsThisMonth: 0, avgTurnaroundHrs: 0,
        }]);
      }
    }
    if (tab === "clinics") {
      if (editingId) {
        setClinics((prev) => prev.map((c) => c.id === editingId ? { ...c, ...clinicForm } : c));
      } else {
        const newId = `cln-${String(clinics.length + 100).padStart(3, "0")}`;
        setClinics((prev) => [...prev, {
          id: newId, ...clinicForm,
          partnersSince: new Date().toISOString(), monthlyVolume: 0,
        }]);
      }
    }
    if (tab === "nurses") {
      if (editingId) {
        setNurses((prev) => prev.map((n) => n.id === editingId ? { ...n, ...nurseForm } : n));
      } else {
        const newId = `n-${String(nurses.length + 100).padStart(3, "0")}`;
        setNurses((prev) => [...prev, {
          id: newId, ...nurseForm,
          activeOrders: 0, totalCompleted: 0,
          joinedAt: new Date().toISOString(),
        }]);
      }
    }
    setModalOpen(false);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    if (tab === "patients") setPatients((p) => p.filter((x) => x.id !== id));
    if (tab === "doctors") setDoctors((p) => p.filter((x) => x.id !== id));
    if (tab === "clinics") setClinics((p) => p.filter((x) => x.id !== id));
    if (tab === "nurses") setNurses((p) => p.filter((x) => x.id !== id));
  }

  return (
    <DashLayout
      title={<>Manage <em>Resources</em></>}
      subtitle="Create, edit, and delete patients, doctors, partner clinics, and nursing staff. Search to filter."
      allowedRoles={["admin"]}
    >
      <style dangerouslySetInnerHTML={{ __html: MANAGE_CSS }} />

      <Link href="/dashboard/admin" style={{ fontSize: 13, color: "var(--teal)", textDecoration: "none", marginBottom: 18, display: "inline-block" }}>
        ← Back to admin overview
      </Link>

      <div className="manage-tabs">
        {(["patients", "doctors", "clinics", "nurses"] as Tab[]).map((t) => (
          <button key={t} className={`mt-btn ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setExpandedId(null); }}>
            {t === "patients" && `👤 Patients (${patients.length})`}
            {t === "doctors" && `👨‍⚕️ Doctors (${doctors.length})`}
            {t === "clinics" && `🏥 Clinics (${clinics.length})`}
            {t === "nurses" && `💉 Nurses (${nurses.length})`}
          </button>
        ))}
      </div>

      <div className="manage-actions">
        <input
          className="search-input"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${tab}...`}
        />
        <button className="add-btn" onClick={openAdd}>
          + Add new {tab.slice(0, -1)}
        </button>
      </div>

      {tab === "patients" && (
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <table className="dash-table">
            <thead>
              <tr><th>Name</th><th>Age/Gender</th><th>Email</th><th>Phone</th><th>Primary Concern</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => (
                <Fragment key={p.id}>
                  <tr>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.age} / {p.gender}</td>
                    <td style={{ fontSize: 11, color: "var(--text-3)" }}>{p.email}</td>
                    <td style={{ fontSize: 11, color: "var(--text-3)" }}>{p.phone}</td>
                    <td style={{ color: "var(--text-3)" }}>{p.primaryConcern}</td>
                    <td>{formatDate(p.joinedAt)}</td>
                    <td>
                      <button className="row-action-btn secondary" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                        {expandedId === p.id ? "Hide" : "Explore"}
                      </button>
                      <button className="row-action-btn primary" onClick={() => openEdit(p.id)}>Edit</button>
                      <button className="row-action-btn danger" onClick={() => handleDelete(p.id)}>Delete</button>
                    </td>
                  </tr>
                  {expandedId === p.id && (
                    <tr>
                      <td colSpan={7} className="expand-row">
                        <strong>Full Clinical Profile:</strong><br />
                        <strong>Vitality Score:</strong> {p.vitalityScore} · <strong>Total sessions:</strong> {p.totalSessions} · <strong>Last visit:</strong> {p.lastVisit ? formatDate(p.lastVisit) : "No visits yet"}<br />
                        <strong>Patient ID:</strong> {p.id} · <strong>Contact:</strong> {p.phone} ({p.email})<br />
                        <strong>Primary concern:</strong> {p.primaryConcern}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filteredPatients.length === 0 && (
                <tr><td colSpan={7} className="empty-state">No patients match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "doctors" && (
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <table className="dash-table">
            <thead>
              <tr><th>Name</th><th>Specialty</th><th>Rating</th><th>Approvals (MTD)</th><th>Avg Turnaround</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredDoctors.map((d) => (
                <tr key={d.id}>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.specialty}</td>
                  <td>★ {d.rating}</td>
                  <td>{d.approvalsThisMonth}</td>
                  <td>{d.avgTurnaroundHrs} hrs</td>
                  <td><span className={`pill ${d.status}`}>{d.status}</span></td>
                  <td>
                    <button className="row-action-btn primary" onClick={() => openEdit(d.id)}>Edit</button>
                    <button className="row-action-btn danger" onClick={() => handleDelete(d.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr><td colSpan={7} className="empty-state">No doctors match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "clinics" && (
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <table className="dash-table">
            <thead>
              <tr><th>Name</th><th>Location</th><th>Contact</th><th>Vol/mo</th><th>Since</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredClinics.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.location}</td>
                  <td>{c.contact}</td>
                  <td>{c.monthlyVolume}</td>
                  <td>{formatDate(c.partnersSince)}</td>
                  <td><span className={`pill ${c.status}`}>{c.status}</span></td>
                  <td>
                    <button className="row-action-btn primary" onClick={() => openEdit(c.id)}>Edit</button>
                    <button className="row-action-btn danger" onClick={() => handleDelete(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filteredClinics.length === 0 && (
                <tr><td colSpan={7} className="empty-state">No clinics match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "nurses" && (
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <table className="dash-table">
            <thead>
              <tr><th>Name</th><th>RN #</th><th>Shift</th><th>Active</th><th>Done</th><th>Rating</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredNurses.map((n) => (
                <Fragment key={n.id}>
                  <tr>
                    <td><strong>{n.name}</strong></td>
                    <td><code style={{ fontSize: 11, color: "var(--text-3)" }}>{n.rnNumber}</code></td>
                    <td style={{ textTransform: "capitalize" }}>{n.shift}</td>
                    <td>{n.activeOrders}</td>
                    <td>{n.totalCompleted}</td>
                    <td>★ {n.rating}</td>
                    <td><span className={`pill ${n.status}`}>{n.status}</span></td>
                    <td>
                      <button className="row-action-btn secondary" onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}>
                        {expandedId === n.id ? "Hide" : "Details"}
                      </button>
                      <button className="row-action-btn primary" onClick={() => openEdit(n.id)}>Edit</button>
                      <button className="row-action-btn danger" onClick={() => handleDelete(n.id)}>Delete</button>
                    </td>
                  </tr>
                  {expandedId === n.id && (
                    <tr>
                      <td colSpan={8} className="expand-row">
                        <strong>Certifications:</strong> {n.certifications.join(", ") || "—"}<br />
                        <strong>Contact:</strong> {n.phone} · <strong>Joined:</strong> {formatDate(n.joinedAt)}<br />
                        <strong>Performance:</strong> {n.totalCompleted} lifetime sessions, {n.rating}★ rating
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filteredNurses.length === 0 && (
                <tr><td colSpan={8} className="empty-state">No nurses match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="mm-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="mm-card">
            <h2 className="mm-title">
              {editingId ? "Edit" : "Add"} <em>{tab.slice(0, -1)}</em>
            </h2>
            <p className="mm-sub">
              {editingId ? "Update existing record." : "Create new record. All fields can be edited later."}
            </p>

            {tab === "patients" && (
              <>
                <div className="mm-field">
                  <label className="mm-label">FULL NAME</label>
                  <input className="mm-input" value={patientForm.name}
                    onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })} />
                </div>
                <div className="mm-row">
                  <div className="mm-field">
                    <label className="mm-label">AGE</label>
                    <input className="mm-input" type="number" value={patientForm.age || ""}
                      onChange={(e) => setPatientForm({ ...patientForm, age: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="mm-field">
                    <label className="mm-label">GENDER</label>
                    <select className="mm-input" value={patientForm.gender}
                      onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value as "M" | "F" })}>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                </div>
                <div className="mm-field">
                  <label className="mm-label">EMAIL</label>
                  <input className="mm-input" type="email" value={patientForm.email}
                    onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })} />
                </div>
                <div className="mm-field">
                  <label className="mm-label">PHONE</label>
                  <input className="mm-input" value={patientForm.phone}
                    onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })} />
                </div>
                <div className="mm-field">
                  <label className="mm-label">PRIMARY CONCERN</label>
                  <input className="mm-input" value={patientForm.primaryConcern}
                    onChange={(e) => setPatientForm({ ...patientForm, primaryConcern: e.target.value })}
                    placeholder="e.g. Chronic fatigue, Melasma, PCOD" />
                </div>
              </>
            )}

            {tab === "doctors" && (
              <>
                <div className="mm-field">
                  <label className="mm-label">FULL NAME (with Dr. prefix)</label>
                  <input className="mm-input" value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    placeholder="e.g. Dr. Arjun Singh" />
                </div>
                <div className="mm-field">
                  <label className="mm-label">SPECIALTY</label>
                  <input className="mm-input" value={doctorForm.specialty}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })} />
                </div>
                <div className="mm-row">
                  <div className="mm-field">
                    <label className="mm-label">RATING (1–5)</label>
                    <input className="mm-input" type="number" min={1} max={5} step={0.1}
                      value={doctorForm.rating}
                      onChange={(e) => setDoctorForm({ ...doctorForm, rating: parseFloat(e.target.value) || 5 })} />
                  </div>
                  <div className="mm-field">
                    <label className="mm-label">STATUS</label>
                    <select className="mm-input" value={doctorForm.status}
                      onChange={(e) => setDoctorForm({ ...doctorForm, status: e.target.value as "available" | "on-leave" })}>
                      <option value="available">Available</option>
                      <option value="on-leave">On leave</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {tab === "clinics" && (
              <>
                <div className="mm-field">
                  <label className="mm-label">CLINIC NAME</label>
                  <input className="mm-input" value={clinicForm.name}
                    onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })} />
                </div>
                <div className="mm-field">
                  <label className="mm-label">LOCATION</label>
                  <input className="mm-input" value={clinicForm.location}
                    onChange={(e) => setClinicForm({ ...clinicForm, location: e.target.value })}
                    placeholder="City" />
                </div>
                <div className="mm-field">
                  <label className="mm-label">PRIMARY CONTACT</label>
                  <input className="mm-input" value={clinicForm.contact}
                    onChange={(e) => setClinicForm({ ...clinicForm, contact: e.target.value })}
                    placeholder="Name of person" />
                </div>
                <div className="mm-field">
                  <label className="mm-label">PARTNERSHIP STATUS</label>
                  <select className="mm-input" value={clinicForm.status}
                    onChange={(e) => setClinicForm({ ...clinicForm, status: e.target.value as "active" | "pending" | "paused" })}>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </>
            )}

            {tab === "nurses" && (
              <>
                <div className="mm-field">
                  <label className="mm-label">FULL NAME (with prefix)</label>
                  <input className="mm-input" value={nurseForm.name}
                    onChange={(e) => setNurseForm({ ...nurseForm, name: e.target.value })}
                    placeholder="e.g. Nurse A. Sharma" />
                </div>
                <div className="mm-row">
                  <div className="mm-field">
                    <label className="mm-label">RN NUMBER</label>
                    <input className="mm-input" value={nurseForm.rnNumber}
                      onChange={(e) => setNurseForm({ ...nurseForm, rnNumber: e.target.value })}
                      placeholder="RN-XX-1234" />
                  </div>
                  <div className="mm-field">
                    <label className="mm-label">PHONE</label>
                    <input className="mm-input" value={nurseForm.phone}
                      onChange={(e) => setNurseForm({ ...nurseForm, phone: e.target.value })} />
                  </div>
                </div>
                <div className="mm-row">
                  <div className="mm-field">
                    <label className="mm-label">SHIFT</label>
                    <select className="mm-input" value={nurseForm.shift}
                      onChange={(e) => setNurseForm({ ...nurseForm, shift: e.target.value as "morning" | "evening" | "night" })}>
                      <option value="morning">Morning</option>
                      <option value="evening">Evening</option>
                      <option value="night">Night</option>
                    </select>
                  </div>
                  <div className="mm-field">
                    <label className="mm-label">STATUS</label>
                    <select className="mm-input" value={nurseForm.status}
                      onChange={(e) => setNurseForm({ ...nurseForm, status: e.target.value as "available" | "on-duty" | "off-duty" })}>
                      <option value="available">Available</option>
                      <option value="on-duty">On duty</option>
                      <option value="off-duty">Off duty</option>
                    </select>
                  </div>
                </div>
                <div className="mm-field">
                  <label className="mm-label">CERTIFICATIONS (comma-separated)</label>
                  <input className="mm-input" value={nurseForm.certifications.join(", ")}
                    onChange={(e) => setNurseForm({ ...nurseForm, certifications: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    placeholder="BLS, ACLS, IV Therapy Cert" />
                </div>
                <div className="mm-field">
                  <label className="mm-label">RATING (1–5)</label>
                  <input className="mm-input" type="number" min={1} max={5} step={0.1}
                    value={nurseForm.rating}
                    onChange={(e) => setNurseForm({ ...nurseForm, rating: parseFloat(e.target.value) || 5 })} />
                </div>
              </>
            )}

            <div className="mm-actions">
              <button className="mm-btn cancel" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="mm-btn save" onClick={handleSave}>
                {editingId ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashLayout>
  );
}
