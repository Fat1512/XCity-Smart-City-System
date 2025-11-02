import { API } from "../utils/axiosConfig";

export async function getBuildings() {
  try {
    const res = await API.get("/buildings");
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
