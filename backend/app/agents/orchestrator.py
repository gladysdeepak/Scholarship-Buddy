"""Intent router and agent graph. Uses LangGraph when installed; same workflow has a local fallback."""
from typing import Any, TypedDict
from app.agents.query_agent import answer_question


class AgentState(TypedDict, total=False):
    message: str
    intent: str
    result: dict
    profile: Any


def _classify(state: AgentState) -> AgentState:
    message = state["message"].lower()
    profile = state.get("profile")
    if profile and any(x in message for x in ("eligible", "eligibility", "match me")):
        intent = "eligibility"
    elif profile and any(x in message for x in ("document", "certificate", "checklist")):
        intent = "documents"
    else:
        intent = "query"
    return {**state, "intent": intent}


def _execute(state: AgentState) -> AgentState:
    if state["intent"] == "documents":
        from app.agents.document_agent import advise_documents
        result = advise_documents(state["profile"])
    elif state["intent"] == "eligibility":
        from app.agents.eligibility_agent import explain_eligibility
        result = explain_eligibility(state["profile"])
    else:
        result = answer_question(state["message"])
    return {**state, "result": result}


def build_graph():
    try:
        from langgraph.graph import StateGraph, START, END
        graph = StateGraph(AgentState)
        graph.add_node("intent_classifier", _classify)
        graph.add_node("agent", _execute)
        graph.add_edge(START, "intent_classifier")
        graph.add_edge("intent_classifier", "agent")
        graph.add_edge("agent", END)
        return graph.compile()
    except ImportError:
        return None


_graph = None


def run_chat(message: str, profile=None) -> dict:
    global _graph
    if _graph is None:
        _graph = build_graph()
    initial = {"message": message, "profile": profile}
    state = _graph.invoke(initial) if _graph else _execute(_classify(initial))
    return {**state["result"], "intent": state.get("intent", "query")}
