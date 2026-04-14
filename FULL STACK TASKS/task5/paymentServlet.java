import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;

public class PaymentServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        double amount = Double.parseDouble(request.getParameter("amount"));

        Connection con = null;

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/student_db", "root", "password");

            // 🔥 Start Transaction
            con.setAutoCommit(false);

            // Deduct from User (id = 1)
            PreparedStatement ps1 = con.prepareStatement(
                    "UPDATE accounts SET balance = balance - ? WHERE account_id = 1");
            ps1.setDouble(1, amount);
            ps1.executeUpdate();

            // Add to Merchant (id = 2)
            PreparedStatement ps2 = con.prepareStatement(
                    "UPDATE accounts SET balance = balance + ? WHERE account_id = 2");
            ps2.setDouble(1, amount);
            ps2.executeUpdate();

            // 🔥 Commit if success
            con.commit();

            PrintWriter out = response.getWriter();
            out.println("<h3 style='color:green'>Payment Successful!</h3>");

        } catch (Exception e) {
            try {
                if (con != null) {
                    // 🔥 Rollback on failure
                    con.rollback();
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }

            PrintWriter out = response.getWriter();
            out.println("<h3 style='color:red'>Payment Failed! Transaction Rolled Back</h3>");
        }
    }
}