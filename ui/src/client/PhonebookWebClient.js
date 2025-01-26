import axios from "axios";

class PhonebookWebClient {
  static BASE_URL = new URL(
    import.meta.env.VITE_PHONEBOOK_BACKEND_SERVER_URI ||
      "http://localhost:3002",
  );

  async getAll() {
    const res = await axios.get(
      `${PhonebookWebClient.BASE_URL.origin}/api/persons`,
    );
    return res.data;
  }

  async save(entryObject) {
    const res = await axios.post(
      `${PhonebookWebClient.BASE_URL.origin}/api/persons`,
      entryObject,
    );
    return res.data;
  }

  async update(id, newEntryObject) {
    const res = await axios.put(
      `${PhonebookWebClient.BASE_URL.origin}/api/persons/${id}`,
      newEntryObject,
    );
    return res.data;
  }

  /**
   *
   * @param id
   * @returns {Promise<axios.AxiosResponse<any>>} removed person
   */
  async delete(id) {
    const res = await axios.delete(
      `${PhonebookWebClient.BASE_URL.origin}/api/persons/${id}`,
    );
    return res.data;
  }
}

export default PhonebookWebClient;
