import { get, post, put, del } from '@data/apiClient';

const BASE = '/moderation'; 

export const ReportContentType = {
  COMMENT: 'comment',
  REVIEW: 'review',
  PROFILE: 'profile'
};

export const ReportStatus = {
  PENDING: 'pending',
  RESOLVED: 'resolved'
};

export const SanctionType = {
  BAND: 'ban',
  SUSPENSION: 'suspension',
};

export async function getAllReports() {
  try {
    return await get(`${BASE}/reports`);
  } catch (error) {
    console.error('Error fetching all reports:', error);
    throw error; 
  }
}


export async function getReportById(reportId) {
  try {
    return await get(`${BASE}/reports/${reportId}`);
  } catch (error) {
    console.error(`Error fetching report with ID ${reportId}:`, error);
    throw error;
  }
}

export async function createReport(reportData) { 
  try {
    if (!reportData.reportedUserId || !reportData.contentType) {
      throw new Error("Missing required report fields: reportedUserId, contentType.");
    }
    return await post(`${BASE}/reports`, reportData);
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
}

export async function updateReport(reportId, updatedReportData) {
  try {
    const response = await fetch(`/moderation/reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedReportData),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el reporte');
    }

    return response;  
  } catch (error) {
    console.error('Error en updateReport:', error);
    throw error;
  }
}

export async function deleteReport(reportId) {
  try {
    return await del(`${BASE}/reports/${reportId}`);
  } catch (error) {
    console.error(`Error deleting report with ID ${reportId}:`, error);
    throw error;
  }
}


export async function resolveReport(reportId) {
  try {
    const existingReport = await getReportById(reportId);

    if (!existingReport) {
      throw new Error(`Report with ID ${reportId} not found for resolution.`);
    }

    const updatedReport = {
      ...existingReport,
      status: ReportStatus.RESOLVED 
    };

    updatedReport.id = reportId;

    await updateReport(reportId, updatedReport);

    console.log(`Report ${reportId} resolved successfully.`);
  } catch (error) {
    console.error(`Failed to resolve report ${reportId}:`, error);
    throw error;
  }
}

export const applySanction = async (sanctionData) => {
  try {

    return await post(`${BASE}/sanctions`, sanctionData);
  } catch (error) {
    console.error('Error applying sanction:', error);
    throw error; 
  }
};

export async function getAllSanctions(filter = 'all') {
  try {
    let url = `${BASE}/sanctions`;
    return await get(url);
  } catch (error) {
    console.error('Error fetching all sanctions:', error);
    throw error;
  }
}

export async function deleteSanction(sanctionId) {
  try {
    return await del(`${BASE}/sanctions/${sanctionId}`);
  } catch (error) {
    console.error(`Error deleting sanction with ID ${sanctionId}:`, error);
    throw error;
  }
}