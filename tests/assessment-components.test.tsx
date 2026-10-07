// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock("@/lib/api", () => ({ apiFetch: apiFetchMock }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

import { AssessmentEditor } from "@/components/admin/assessment-editor";
import { AssessmentSettingsForm } from "@/components/admin/assessment-settings-form";
import { ResetAttemptsButton } from "@/components/admin/reset-attempts-button";
import { TrainerAssignmentForm } from "@/components/admin/trainer-assignment-form";
import { TrainerManagementForm } from "@/components/admin/trainer-management-form";
import { QuizPanel } from "@/components/dashboard/quiz-panel";
import type { Assessment, AssessmentAdmin, Attempt, AttemptResult } from "@/lib/types";

const question = (id: string, status: "suggested" | "approved" = "suggested") => ({
  id,
  prompt: `¿Qué demuestra la pregunta ${id}?`,
  options: [
    { id: "a", text: "Respuesta correcta" },
    { id: "b", text: "Distractor uno" },
    { id: "c", text: "Distractor dos" },
    { id: "d", text: "Distractor tres" },
  ],
  correct_option_id: "a",
  competency: "Aplicación",
  difficulty: "basic",
  assessment_id: "assessment-1",
  explanation: "Explicación de refuerzo.",
  status,
  source_provider: "fake-provider",
  source_model: "fake-model",
  created_at: "2026-10-07T00:00:00Z",
  updated_at: "2026-10-07T00:00:00Z",
});

const assessment: Assessment = {
  id: "assessment-1",
  target_type: "lesson",
  target_id: "lesson-1",
  title: "Quiz de comunicación",
  status: "published",
  question_count: 3,
  passing_score: 80,
  max_attempts: 3,
  approved_question_count: 3,
  attempts_used: 0,
  attempts_remaining: 3,
  passed: false,
  locked: false,
  lock_reason: null,
  questions: [],
};

const attempt: Attempt = {
  id: "attempt-1",
  assessment_id: "assessment-1",
  attempt_number: 1,
  cycle: 1,
  attempts_remaining: 3,
  questions: ["q1", "q2", "q3"].map((id) => {
    const value = question(id);
    return {
      id: value.id,
      prompt: value.prompt,
      options: value.options,
      competency: value.competency,
      difficulty: value.difficulty,
    };
  }),
};

const result: AttemptResult = {
  id: "attempt-1",
  assessment_id: "assessment-1",
  attempt_number: 1,
  cycle: 1,
  score: 66.7,
  passed: false,
  attempts_used: 1,
  attempts_remaining: 2,
  question_results: attempt.questions.map((value, index) => ({
    question_id: value.id,
    selected_option_id: index === 0 ? "b" : "a",
    correct_option_id: "a",
    is_correct: index !== 0,
    explanation: "Explicación de refuerzo.",
    competency: "Aplicación",
  })),
  lesson_completed: false,
  module_completed: false,
  submitted_at: "2026-10-07T00:00:00Z",
};

function adminAssessment(questions = [question("q1"), question("q2"), question("q3")]): AssessmentAdmin {
  return { ...assessment, questions };
}

describe("QuizPanel", () => {
  beforeEach(() => apiFetchMock.mockReset());

  it("renders unavailable, locked, passed and exhausted states without start actions", () => {
    const { rerender } = render(<QuizPanel assessment={null} />);
    expect(screen.getByText("Esta evaluación todavía no está disponible.")).toBeInTheDocument();

    rerender(<QuizPanel assessment={{ ...assessment, locked: true, lock_reason: "Aprueba las lecciones." }} />);
    expect(screen.getByText("Evaluación bloqueada.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /iniciar/i })).not.toBeInTheDocument();

    rerender(<QuizPanel assessment={{ ...assessment, passed: true }} />);
    expect(screen.getByText("Evaluación aprobada.")).toBeInTheDocument();

    rerender(<QuizPanel assessment={{ ...assessment, attempts_remaining: 0 }} />);
    expect(screen.queryByRole("button", { name: /iniciar/i })).not.toBeInTheDocument();
  });

  it("starts, requires every answer, submits the selected options and displays reinforcement", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValueOnce(attempt).mockResolvedValueOnce(result);
    render(<QuizPanel assessment={assessment} />);

    await user.click(screen.getByRole("button", { name: "Iniciar evaluación" }));
    expect(screen.getByText("Evaluación activa")).toBeInTheDocument();
    const submitButton = screen.getByRole("button", { name: "Enviar respuestas" });
    expect(submitButton).toBeDisabled();

    for (const questionValue of attempt.questions) {
      await user.click(screen.getAllByLabelText("Respuesta correcta")[attempt.questions.indexOf(questionValue)]);
    }
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    await waitFor(() => expect(screen.getByText("Todavía hay espacio para reforzar.")).toBeInTheDocument());
    expect(screen.getByText("66.7%", { exact: false })).toBeInTheDocument();
    expect(screen.getAllByText("Explicación de refuerzo.").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Intentar de nuevo" })).toBeInTheDocument();
    expect(apiFetchMock).toHaveBeenLastCalledWith("/attempts/attempt-1/submit", expect.objectContaining({ method: "POST" }));
    expect(JSON.stringify(apiFetchMock.mock.calls.at(-1))).not.toContain("correct_option_id");
  });

  it("surfaces start and submit errors", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockRejectedValueOnce(new Error("Quiz no disponible"));
    render(<QuizPanel assessment={assessment} />);
    await user.click(screen.getByRole("button", { name: "Iniciar evaluación" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Quiz no disponible");
  });

  it("handles module quizzes, successful passes and non-Error submission failures", async () => {
    const user = userEvent.setup();
    const passed = { ...result, passed: true, attempts_remaining: 0, question_results: result.question_results.map((item) => ({ ...item, explanation: "" })) };
    apiFetchMock.mockResolvedValueOnce(attempt).mockResolvedValueOnce(passed);
    render(<QuizPanel assessment={{ ...assessment, target_type: "module", lock_reason: null }} />);
    expect(screen.getByText("Evaluación final")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Iniciar evaluación" }));
    for (const questionValue of attempt.questions) await user.click(screen.getAllByLabelText("Respuesta correcta")[attempt.questions.indexOf(questionValue)]);
    await user.click(screen.getByRole("button", { name: "Enviar respuestas" }));
    expect(await screen.findByText("Dominio demostrado.")).toBeInTheDocument();
    expect(screen.getAllByText("Revisa nuevamente el contenido de esta competencia.").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Intentar de nuevo" })).not.toBeInTheDocument();

    cleanup();
    apiFetchMock.mockResolvedValueOnce(attempt).mockRejectedValueOnce("fallo de calificación");
    render(<QuizPanel assessment={assessment} />);
    await user.click(screen.getByRole("button", { name: "Iniciar evaluación" }));
    for (const questionValue of attempt.questions) await user.click(screen.getAllByLabelText("Respuesta correcta")[attempt.questions.indexOf(questionValue)]);
    await user.click(screen.getByRole("button", { name: "Enviar respuestas" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos calificar la evaluación.");

    cleanup();
    apiFetchMock.mockRejectedValueOnce("fallo de inicio");
    render(<QuizPanel assessment={assessment} />);
    await user.click(screen.getByRole("button", { name: "Iniciar evaluación" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos iniciar la evaluación.");

    cleanup();
    let resolveAttempt!: (value: Attempt) => void;
    const pendingAttempt = new Promise<Attempt>((resolve) => { resolveAttempt = resolve; });
    apiFetchMock.mockReturnValueOnce(pendingAttempt);
    render(<QuizPanel assessment={assessment} />);
    await user.click(screen.getByRole("button", { name: "Iniciar evaluación" }));
    expect(screen.getByRole("button", { name: "Iniciando…" })).toBeDisabled();
    resolveAttempt(attempt);
    expect(await screen.findByText("Evaluación activa")).toBeInTheDocument();
  });
});

describe("educator controls", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    vi.stubGlobal("location", { pathname: "/admin/analytics/students/student-1" });
  });

  it("prepares an assessment, generates suggestions, approves questions and publishes when ready", async () => {
    const user = userEvent.setup();
    apiFetchMock
      .mockResolvedValueOnce(adminAssessment())
      .mockResolvedValueOnce([question("q4")])
      .mockResolvedValueOnce(question("q1", "approved"))
      .mockResolvedValueOnce(adminAssessment([question("q1", "approved"), question("q2", "approved"), question("q3", "approved")]));
    render(<AssessmentEditor target="lesson" targetId="lesson-1" />);
    await user.click(screen.getByRole("button", { name: "Preparar evaluación" }));
    expect(await screen.findByText("Banco de preguntas preparado.")).toBeInTheDocument();

    cleanup();
    render(<AssessmentEditor target="lesson" targetId="lesson-1" initialAssessment={adminAssessment()} />);
    await user.click(screen.getByRole("button", { name: "Sugerir con IA" }));
    expect(await screen.findByText("Sugerencias generadas. Revísalas antes de publicarlas.")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: /aprobar pregunta/i })[0]);
    expect(apiFetchMock).toHaveBeenCalledWith("/educator/questions/q1/approve", expect.objectContaining({ method: "POST" }));

    cleanup();
    render(<AssessmentEditor target="lesson" targetId="lesson-1" initialAssessment={adminAssessment([question("q1", "approved"), question("q2", "approved"), question("q3", "approved")])} />);
    await user.click(screen.getByRole("button", { name: "Publicar" }));
    expect(await screen.findByText("Evaluación publicada.")).toBeInTheDocument();
  });

  it("keeps publishing disabled when the approved bank is incomplete", () => {
    render(<AssessmentEditor target="lesson" targetId="lesson-1" initialAssessment={adminAssessment([question("q1", "approved")])} />);
    expect(screen.getByRole("button", { name: "Publicar" })).toBeDisabled();
  });

  it("edits the complete editorial question payload", async () => {
    const user = userEvent.setup();
    const updated = { ...question("q1", "approved"), prompt: "¿Qué demuestra la versión revisada?" };
    apiFetchMock.mockResolvedValueOnce(updated);
    render(<AssessmentEditor target="lesson" targetId="lesson-1" initialAssessment={adminAssessment([question("q1", "approved")])} />);

    await user.click(screen.getByRole("button", { name: "Editar pregunta" }));
    await user.clear(screen.getByLabelText("Pregunta"));
    await user.type(screen.getByLabelText("Pregunta"), "¿Qué demuestra la versión revisada?");
    await user.clear(screen.getByLabelText("Opción A"));
    await user.type(screen.getByLabelText("Opción A"), "Respuesta revisada");
    await user.clear(screen.getByLabelText("Competencia"));
    await user.type(screen.getByLabelText("Competencia"), "Pensamiento crítico");
    await user.selectOptions(screen.getByLabelText("Respuesta correcta"), "c");
    await user.selectOptions(screen.getByLabelText("Dificultad"), "advanced");
    await user.clear(screen.getByLabelText("Explicación"));
    await user.type(screen.getByLabelText("Explicación"), "Explicación actualizada.");
    await user.click(screen.getByRole("button", { name: "Guardar pregunta" }));

    await waitFor(() => expect(screen.getByText("Pregunta actualizada.")).toBeInTheDocument());
    expect(apiFetchMock).toHaveBeenCalledWith("/educator/questions/q1", expect.objectContaining({
      method: "PATCH",
      body: expect.stringContaining('"correct_option_id":"c"'),
    }));
  });

  it("shows an empty bank and reports editorial action failures", async () => {
    const user = userEvent.setup();
    render(<AssessmentEditor target="lesson" targetId="lesson-1" initialAssessment={adminAssessment([])} />);
    expect(screen.getByText(/Todavía no hay sugerencias/)).toBeInTheDocument();

    cleanup();
    apiFetchMock.mockRejectedValueOnce("prepare failed");
    render(<AssessmentEditor target="lesson" targetId="lesson-1" />);
    await user.click(screen.getByRole("button", { name: "Preparar evaluación" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos preparar la evaluación.");

    cleanup();
    apiFetchMock.mockRejectedValueOnce(new Error("generate failed"));
    render(<AssessmentEditor target="lesson" targetId="lesson-1" initialAssessment={adminAssessment()} />);
    await user.click(screen.getByRole("button", { name: "Sugerir con IA" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("generate failed");

    cleanup();
    apiFetchMock.mockRejectedValueOnce(new Error("approve failed"));
    render(<AssessmentEditor target="lesson" targetId="lesson-1" initialAssessment={adminAssessment()} />);
    await user.click(screen.getAllByRole("button", { name: /aprobar pregunta/i })[0]);
    expect(await screen.findByRole("alert")).toHaveTextContent("approve failed");

    cleanup();
    apiFetchMock.mockRejectedValueOnce("save failed");
    render(<AssessmentEditor target="lesson" targetId="lesson-1" initialAssessment={adminAssessment([question("q1", "approved")])} />);
    await user.click(screen.getByRole("button", { name: "Editar pregunta" }));
    await user.click(screen.getByRole("button", { name: "Guardar pregunta" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos actualizar la pregunta.");

    cleanup();
    apiFetchMock.mockRejectedValueOnce(new Error("publish failed"));
    render(<AssessmentEditor target="lesson" targetId="lesson-1" initialAssessment={adminAssessment([question("q1", "approved"), question("q2", "approved"), question("q3", "approved")])} />);
    await user.click(screen.getByRole("button", { name: "Publicar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("publish failed");
  });

  it("saves settings and reports API errors while keeping attempts fixed", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValueOnce({ passing_score: 90, max_attempts: 3, default_question_count: 4 });
    render(<AssessmentSettingsForm initial={{ passing_score: 80, max_attempts: 3, default_question_count: 5 }} />);
    expect(screen.getByText(/Los intentos máximos son siempre 3 por ciclo/)).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Porcentaje mínimo"));
    await user.type(screen.getByLabelText("Porcentaje mínimo"), "90");
    await user.selectOptions(screen.getByLabelText("Preguntas por quiz"), "4");
    await user.click(screen.getByRole("button", { name: "Guardar configuración" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Configuración actualizada."));
    expect(apiFetchMock).toHaveBeenCalledWith("/admin/assessment-settings", expect.objectContaining({ method: "PATCH", body: JSON.stringify({ passing_score: 90, default_question_count: 4 }) }));

    apiFetchMock.mockRejectedValueOnce(new Error("Configuración inválida"));
    await user.click(screen.getByRole("button", { name: "Guardar configuración" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Configuración inválida");

    apiFetchMock.mockRejectedValueOnce("bad settings");
    await user.click(screen.getByRole("button", { name: "Guardar configuración" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos guardar la configuración.");
  });

  it("assigns a trainer only after a selection and handles empty trainer lists", async () => {
    const user = userEvent.setup();
    const students = [{ id: "student-1", full_name: "Estudiante", email: "student@example.com" }];
    const trainers = [{ id: "trainer-1", full_name: "Trainer", email: "trainer@example.com" }];
    apiFetchMock.mockResolvedValueOnce({ ok: true });
    render(<TrainerAssignmentForm students={students} trainers={trainers} />);
    expect(screen.getByRole("button", { name: "Asignar" })).toBeDisabled();
    await user.selectOptions(screen.getByRole("combobox"), "trainer-1");
    expect(screen.getByRole("button", { name: "Asignar" })).not.toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Asignar" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Asignación guardada.");

    render(<TrainerAssignmentForm students={students} trainers={[]} />);
    expect(screen.getByText(/Primero crea o promueve/)).toBeInTheDocument();
  });

  it("reports trainer assignment failures", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockRejectedValueOnce("assignment failed");
    render(<TrainerAssignmentForm students={[{ id: "student-1", full_name: "Estudiante", email: "student@example.com" }]} trainers={[{ id: "trainer-1", full_name: "Trainer", email: "trainer@example.com" }]} />);
    await user.selectOptions(screen.getByRole("combobox"), "trainer-1");
    await user.click(screen.getByRole("button", { name: "Asignar" }));
    expect(await screen.findByRole("status")).toHaveTextContent("No pudimos guardar la asignación.");
  });

  it("invites trainers and promotes existing users", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValueOnce({ id: "trainer-2" }).mockResolvedValueOnce({ id: "student-1", role: "trainer" });
    render(<TrainerManagementForm candidates={[{ id: "student-1", full_name: "Estudiante", email: "student@example.com" }]} />);

    await user.type(screen.getByLabelText("Nombre completo"), "Nuevo trainer");
    await user.type(screen.getByLabelText("Correo"), "trainer@example.com");
    await user.type(screen.getByLabelText("Contraseña temporal"), "password-123");
    await user.click(screen.getByRole("button", { name: "Enviar invitación" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Invitación de trainer creada.");
    expect(apiFetchMock).toHaveBeenCalledWith("/admin/trainers/invitations", expect.objectContaining({ method: "POST" }));

    await user.click(screen.getByRole("button", { name: "Promover" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Usuario promovido a trainer.");
    expect(apiFetchMock).toHaveBeenLastCalledWith("/admin/users/student-1/role", expect.objectContaining({ method: "PATCH" }));
  });

  it("reports invitation and promotion failures", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockRejectedValueOnce(new Error("invite failed"));
    render(<TrainerManagementForm candidates={[{ id: "student-1", full_name: "Estudiante", email: "student@example.com" }]} />);
    await user.type(screen.getByLabelText("Nombre completo"), "Nuevo trainer");
    await user.type(screen.getByLabelText("Correo"), "trainer@example.com");
    await user.type(screen.getByLabelText("Contraseña temporal"), "password-123");
    await user.click(screen.getByRole("button", { name: "Enviar invitación" }));
    expect(await screen.findByRole("status")).toHaveTextContent("invite failed");

    apiFetchMock.mockRejectedValueOnce("promotion failed");
    await user.click(screen.getByRole("button", { name: "Promover" }));
    expect(await screen.findByRole("status")).toHaveTextContent("No pudimos promover el usuario.");

    cleanup();
    apiFetchMock.mockRejectedValueOnce("invite generic").mockRejectedValueOnce(new Error("promotion failed"));
    render(<TrainerManagementForm candidates={[{ id: "student-1", full_name: "Estudiante", email: "student@example.com" }]} />);
    await user.type(screen.getByLabelText("Nombre completo"), "Nuevo trainer");
    await user.type(screen.getByLabelText("Correo"), "trainer@example.com");
    await user.type(screen.getByLabelText("Contraseña temporal"), "password-123");
    await user.click(screen.getByRole("button", { name: "Enviar invitación" }));
    expect(await screen.findByRole("status")).toHaveTextContent("No pudimos crear la invitación.");
    await user.click(screen.getByRole("button", { name: "Promover" }));
    expect(await screen.findByRole("status")).toHaveTextContent("promotion failed");

    cleanup();
    render(<TrainerManagementForm candidates={[]} />);
    expect(screen.queryByRole("button", { name: "Promover" })).not.toBeInTheDocument();
  });

  it("resets a selected assessment with an encoded reason and reports failures", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValueOnce({ cycle: 2 });
    render(<ResetAttemptsButton assessmentIds={["assessment 1"]} />);
    await user.click(screen.getByRole("button", { name: "Reiniciar ciclo" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Ciclo reiniciado");
    expect(apiFetchMock).toHaveBeenCalledWith(expect.stringContaining("reason=Reinicio%20administrativo%20solicitado%20desde%20seguimiento"), expect.objectContaining({ method: "POST" }));

    apiFetchMock.mockRejectedValueOnce(new Error("No autorizado"));
    await user.click(screen.getByRole("button", { name: "Reiniciar ciclo" }));
    expect(await screen.findByRole("status")).toHaveTextContent("No autorizado");

    apiFetchMock.mockRejectedValueOnce("reset failed");
    await user.click(screen.getByRole("button", { name: "Reiniciar ciclo" }));
    expect(await screen.findByRole("status")).toHaveTextContent("No pudimos reiniciar los intentos.");

    cleanup();
    render(<ResetAttemptsButton assessmentIds={[]} />);
    expect(screen.getByRole("button", { name: "Reiniciar ciclo" })).toBeDisabled();

    cleanup();
    render(<ResetAttemptsButton assessmentIds={["assessment-1", "assessment-2"]} />);
    await user.selectOptions(screen.getByRole("combobox"), "assessment-2");
    expect(screen.getByRole("button", { name: "Reiniciar ciclo" })).not.toBeDisabled();
  });
});
