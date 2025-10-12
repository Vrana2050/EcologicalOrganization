from dependencies import AdvancedElasticSearchRequest, SearchTermType, FIELD_MAP


def build_elastic_query_documents_pdf(request: AdvancedElasticSearchRequest):
    must_clauses = []

    if request.search_term_type == SearchTermType.DIRECTORY_NAME:
        return {"query": {"bool": {"must_not": [{"match_all": {}}]}}}


    if request.allowed_documents:
        must_clauses.append({"terms": {"document_id": request.allowed_documents}})
    else:
        return {"query": {"bool": {"must_not": [{"match_all": {}}]}}}

    if request.parent_directory_ids:
        must_clauses.append({"terms": {"parent_directory_id": request.parent_directory_ids}})

    if request.creator_id is not None:
        must_clauses.append({"term": {"creator_id": request.creator_id}})

    if request.created_from or request.created_to:
        range_query = {}
        if request.created_from:
            range_query["gte"] = request.created_from
        if request.created_to:
            range_query["lte"] = request.created_to
        must_clauses.append({"range": {"created_at": range_query}})

    if request.tags:
        must_clauses.append({
            "bool": {
                "should": [
                    {"term": {"tags": {"value": tag, "boost": 2.0}}} for tag in request.tags
                ]
            }
        })

    if request.search_term:
        search_conditions = []

        if request.search_term_type in {SearchTermType.ALL, SearchTermType.DOCUMENT_NAME}:
            search_conditions.append({
                "wildcard": {
                    "name": {
                        "value": f"*{request.search_term.lower()}*",
                        "rewrite": "constant_score"
                    }
                }
            })

        if request.search_term_type == SearchTermType.ALL:
            search_conditions.append({
                "multi_match": {
                    "query": request.search_term,
                    "fields": ["name^3", "summary^2"],
                    "fuzziness": "AUTO",
                    "type": "best_fields"
                }
            })
        elif request.search_term_type == SearchTermType.CONTENT:
            search_conditions.append({
                "multi_match": {
                    "query": request.search_term,
                    "fields": ["summary^3"],
                    "fuzziness": "AUTO",
                    "type": "best_fields"
                }
            })
        elif request.search_term_type == SearchTermType.DOCUMENT_NAME:
            search_conditions.append({
                "multi_match": {
                    "query": request.search_term,
                    "fields": ["name^3"],
                    "fuzziness": "AUTO",
                    "type": "best_fields"
                }
            })

        if len(search_conditions) > 1:
            must_clauses.append({
                "bool": {
                    "should": search_conditions,
                    "minimum_should_match": 1
                }
            })
        elif len(search_conditions) == 1:
            must_clauses.append(search_conditions[0])

    for meta in request.metadata:
        operator = meta.operator.value
        value = meta.value



        field_name = f"metadata.{FIELD_MAP[meta.metadata_type]}"

        # Create query based on operator
        if operator == "is":
            query_clause = {"term": {field_name: value}}
        elif operator == "is not":
            query_clause = {"bool": {"must_not": {"term": {field_name: value}}}}
        elif operator == "includes":
            query_clause = {"wildcard": {field_name: {"value": f"*{value}*"}}}
        elif operator == "excludes":
            query_clause = {"bool": {"must_not": {"wildcard": {field_name: {"value": f"*{value}*"}}}}}
        elif operator == "is below":
            query_clause = {"range": {field_name: {"lt": value}}}
        elif operator == "is above":
            query_clause = {"range": {field_name: {"gt": value}}}
        elif operator == "at least":
            query_clause = {"range": {field_name: {"gte": value}}}
        elif operator == "at most":
            query_clause = {"range": {field_name: {"lte": value}}}
        elif operator == "exists":
            query_clause = {"exists": {"field": field_name}}
        elif operator == "does not exist":
            query_clause = {"bool": {"must_not": {"exists": {"field": field_name}}}}
        else:
            continue  # Skip unknown operators

        # Create nested query
        nested_query = {
            "nested": {
                "path": "metadata",
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"metadata.id": meta.id}},
                            query_clause
                        ]
                    }
                }
            }
        }

        must_clauses.append(nested_query)

    query = {
        "query": {
            "bool": {
                "must": must_clauses
            }
        },
        # 🔥 Dodaj highlight sekciju
        "highlight": {
            "pre_tags": ['<b><font color="#d600d2">'],
            "post_tags": ['</font></b>'],
            "fields": {
                "summary": {
                    "number_of_fragments": 0,     # 👈 Vraća ceo summary
                    "fragment_size": 2000         # 👈 Ograniči maksimalnu dužinu ako je predug
                },
                "name": {
                    "type": "unified",
                    "fragment_size": 100,
                    "number_of_fragments": 0,
                    "boundary_scanner": "word"
                }
            },
            "order": "score"
        }
    }

    return query



def build_elastic_query_directories_pdf(request: AdvancedElasticSearchRequest):

    if request.search_term_type == SearchTermType.CONTENT or request.search_term_type == SearchTermType.DOCUMENT_NAME:
        return {"query": {"bool": {"must_not": [{"match_all": {}}]}}}

    must_clauses = []

    if request.allowed_directories:
        must_clauses.append({"terms": {"directory_id": request.allowed_directories}})
    else:
        return {"query": {"bool": {"must_not": [{"match_all": {}}]}}}

    if request.parent_directory_ids:
        must_clauses.append({"terms": {"parent_directory_id": request.parent_directory_ids}})

    if request.creator_id is not None:
        must_clauses.append({"term": {"creator_id": request.creator_id}})

    if request.created_from or request.created_to:
        range_query = {}
        if request.created_from:
            range_query["gte"] = request.created_from
        if request.created_to:
            range_query["lte"] = request.created_to
        must_clauses.append({"range": {"created_at": range_query}})

    if request.tags:
        must_clauses.append({
            "bool": {
                "should": [
                    {"term": {"tags": {"value": tag, "boost": 2.0}}} for tag in request.tags
                ]
            }
        })

    if request.search_term:
        search_conditions = []

        if request.search_term and request.search_term_type in {SearchTermType.ALL, SearchTermType.DIRECTORY_NAME}:
            search_conditions.append({
                "wildcard": {
                        "name": {
                            "value": f"*{request.search_term.lower()}*",
                            "rewrite": "constant_score"
                        }
                    }
            })

            search_conditions.append({
                "multi_match": {
                    "query": request.search_term,
                    "fields": ["name^3"],
                    "fuzziness": "AUTO",
                    "type": "best_fields"
                }
            })

            must_clauses.append({
                "bool": {
                    "should": search_conditions,
                    "minimum_should_match": 1
                }
            })

    for meta in request.metadata:
        operator = meta.operator.value
        value = meta.value

        field_name = f"metadata.{FIELD_MAP[meta.metadata_type]}"

        if operator == "is":
            query_clause = {"term": {field_name: value}}
        elif operator == "is not":
            query_clause = {"bool": {"must_not": {"term": {field_name: value}}}}
        elif operator == "includes":
            query_clause = {"wildcard": {field_name: {"value": f"*{value}*"}}}
        elif operator == "excludes":
            query_clause = {"bool": {"must_not": {"wildcard": {field_name: {"value": f"*{value}*"}}}}}
        elif operator == "is below":
            query_clause = {"range": {field_name: {"lt": value}}}
        elif operator == "is above":
            query_clause = {"range": {field_name: {"gt": value}}}
        elif operator == "at least":
            query_clause = {"range": {field_name: {"gte": value}}}
        elif operator == "at most":
            query_clause = {"range": {field_name: {"lte": value}}}
        elif operator == "exists":
            query_clause = {"exists": {"field": field_name}}
        elif operator == "does not exist":
            query_clause = {"bool": {"must_not": {"exists": {"field": field_name}}}}
        else:
            continue  # Skip unknown operators

        # Create nested query
        nested_query = {
            "nested": {
                "path": "metadata",
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"metadata.id": meta.id}},
                            query_clause
                        ]
                    }
                }
            }
        }

        must_clauses.append(nested_query)

    query = {
        "query": {
            "bool": {
                "must": must_clauses
            }
        },
        "highlight": {
            "pre_tags": ['<b><font color="#d600d2">'],
            "post_tags": ['</font></b>'],
            "fields": {
                "name": {
                    "type": "unified",  # 👈 Koristite unified umesto fvh
                    "fragment_size": 100,
                    "number_of_fragments": 0,
                    "boundary_scanner": "word"  # Bolje granice reči
                }
            },
            "order": "score"  # Prikaži najrelevantnije fragmente prvo
        }
    }

    return query
