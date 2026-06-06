// jika response berhasil
export const sendSuccess = (res, message, data = null, statusCode = 200) => {
    const response = {
        success: true,
        message,
    };

    if (data != null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

// jika response gagal karena masalah pada sisi server
export const sendError = (res, message, data = null, statusCode = 500, errors=null) => {
    const response = {
        success: false,
        message,
    };

    if (errors != null) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

export const sendPaginated = (res, message, data, meta) => {
    return res.status(200).json({
        success: true,
        message,
        data,
        meta: {
            page: meta.page,
            limit: meta.limit,
            total: meta.total,
            totalPages: Math.cell(meta.total / meta.limit),
        },
    });
};